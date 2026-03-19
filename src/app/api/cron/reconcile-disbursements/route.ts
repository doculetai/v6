import { captureException, captureMessage } from '@sentry/nextjs';
import { and, eq, isNotNull, lt } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import {
  disbursementFees,
  disbursements,
  sponsorships,
  users,
} from '@/db/schema';
import { calculateFee, getActiveFeeConfig } from '@/db/queries/platform-fees';
import { insertTransaction } from '@/db/queries/transactions';
import { sendDisbursementFailedEmail } from '@/lib/email/send-disbursement-failed-email';
import { fetchPaystackTransfer } from '@/lib/paystack/fetch-transfer';

/** Stale threshold: disbursements processing longer than 30 minutes */
const STALE_MINUTES = 30;

/** Max disbursements to reconcile per cron run to stay within execution limits */
const BATCH_LIMIT = 50;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ReconcileResult = {
  id: string;
  action: 'completed' | 'failed' | 'skipped' | 'error';
  detail: string;
};

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackKey) {
    captureMessage('reconcile-disbursements: PAYSTACK_SECRET_KEY missing', {
      level: 'error',
      tags: { cron: 'reconcile-disbursements' },
    });
    return NextResponse.json(
      { error: 'PAYSTACK_SECRET_KEY not configured' },
      { status: 500 },
    );
  }

  try {
    const staleThreshold = new Date(
      Date.now() - STALE_MINUTES * 60 * 1000,
    );

    const staleDisbursements = await db
      .select({
        id: disbursements.id,
        paystackReference: disbursements.paystackReference,
        amountKobo: disbursements.amountKobo,
        sponsorshipId: disbursements.sponsorshipId,
      })
      .from(disbursements)
      .where(
        and(
          eq(disbursements.status, 'processing'),
          isNotNull(disbursements.paystackReference),
          lt(disbursements.updatedAt, staleThreshold),
        ),
      )
      .limit(BATCH_LIMIT);

    if (staleDisbursements.length === 0) {
      return NextResponse.json({ ok: true, reconciled: 0, results: [] });
    }

    const results: ReconcileResult[] = [];

    // Process sequentially to respect Paystack rate limits
    for (const disb of staleDisbursements) {
      const result = await reconcileSingleDisbursement(disb);
      results.push(result);
    }

    const summary = {
      ok: true,
      reconciled: staleDisbursements.length,
      completed: results.filter((r) => r.action === 'completed').length,
      failed: results.filter((r) => r.action === 'failed').length,
      skipped: results.filter((r) => r.action === 'skipped').length,
      errors: results.filter((r) => r.action === 'error').length,
      results,
    };

    captureMessage('reconcile-disbursements: run complete', {
      level: 'info',
      tags: { cron: 'reconcile-disbursements' },
      extra: summary,
    });

    return NextResponse.json(summary);
  } catch (err) {
    captureException(err, { tags: { cron: 'reconcile-disbursements' } });
    return NextResponse.json(
      { error: 'Reconciliation failed' },
      { status: 500 },
    );
  }
}

async function reconcileSingleDisbursement(disb: {
  id: string;
  paystackReference: string | null;
  amountKobo: number;
  sponsorshipId: string;
}): Promise<ReconcileResult> {
  if (!disb.paystackReference) {
    return {
      id: disb.id,
      action: 'skipped',
      detail: 'No paystack reference',
    };
  }

  try {
    const transfer = await fetchPaystackTransfer(disb.paystackReference);

    if (!transfer.success) {
      captureException(
        new Error(`Paystack verify failed for ${disb.id}: ${transfer.error}`),
        { tags: { cron: 'reconcile-disbursements' } },
      );
      return { id: disb.id, action: 'error', detail: transfer.error };
    }

    switch (transfer.status) {
      case 'success':
        return await handleCompleted(disb);

      case 'failed':
      case 'reversed':
        return await handleFailed(disb, transfer.status);

      case 'pending':
      case 'processing':
        return {
          id: disb.id,
          action: 'skipped',
          detail: `Still ${transfer.status} on Paystack`,
        };

      default:
        return {
          id: disb.id,
          action: 'skipped',
          detail: `Unknown Paystack status: ${transfer.status}`,
        };
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown reconciliation error';
    captureException(err, {
      tags: { cron: 'reconcile-disbursements' },
      extra: { disbursementId: disb.id },
    });
    return { id: disb.id, action: 'error', detail: message };
  }
}

/**
 * Mark disbursement as completed, insert transaction and fee records.
 */
async function handleCompleted(disb: {
  id: string;
  amountKobo: number;
  sponsorshipId: string;
}): Promise<ReconcileResult> {
  // Look up sponsorship to get sponsor user id and currency
  const [sponsorship] = await db
    .select({
      sponsorId: sponsorships.sponsorId,
      currency: sponsorships.currency,
    })
    .from(sponsorships)
    .where(eq(sponsorships.id, disb.sponsorshipId))
    .limit(1);

  const currency = sponsorship?.currency ?? 'NGN';

  // Update disbursement status
  await db
    .update(disbursements)
    .set({
      status: 'disbursed',
      disbursedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(disbursements.id, disb.id));

  // Insert disbursement transaction record
  await insertTransaction(db, {
    type: 'disbursement',
    entityType: 'disbursement',
    entityId: disb.id,
    amountKobo: disb.amountKobo,
    currency,
    userId: sponsorship?.sponsorId ?? null,
    meta: JSON.stringify({ reconciledAt: new Date().toISOString() }),
  });

  // Calculate and record platform fee
  const feeConfig = await getActiveFeeConfig(db, currency);
  const feeKobo = calculateFee(disb.amountKobo, feeConfig);

  if (feeKobo > 0) {
    await db.insert(disbursementFees).values({
      disbursementId: disb.id,
      amountKobo: feeKobo,
      currency,
    });

    await insertTransaction(db, {
      type: 'platform_fee',
      entityType: 'disbursement',
      entityId: disb.id,
      amountKobo: feeKobo,
      currency,
      userId: sponsorship?.sponsorId ?? null,
      meta: JSON.stringify({
        feeConfig: feeConfig
          ? { feeType: feeConfig.feeType, valueKobo: feeConfig.valueKobo }
          : null,
      }),
    });
  }

  return {
    id: disb.id,
    action: 'completed',
    detail: `Marked disbursed, fee=${feeKobo}`,
  };
}

/**
 * Mark disbursement as failed and notify the sponsor via email.
 */
async function handleFailed(
  disb: {
    id: string;
    amountKobo: number;
    sponsorshipId: string;
  },
  paystackStatus: string,
): Promise<ReconcileResult> {
  // Update disbursement status
  await db
    .update(disbursements)
    .set({
      status: 'failed',
      updatedAt: new Date(),
    })
    .where(eq(disbursements.id, disb.id));

  // Look up sponsor email for notification
  const [sponsorship] = await db
    .select({
      sponsorId: sponsorships.sponsorId,
      currency: sponsorships.currency,
    })
    .from(sponsorships)
    .where(eq(sponsorships.id, disb.sponsorshipId))
    .limit(1);

  if (sponsorship?.sponsorId) {
    const [sponsor] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, sponsorship.sponsorId))
      .limit(1);

    if (sponsor?.email) {
      try {
        await sendDisbursementFailedEmail({
          toEmail: sponsor.email,
          amountKobo: disb.amountKobo,
          currency: sponsorship.currency,
        });
      } catch (emailErr) {
        captureException(emailErr, {
          tags: { cron: 'reconcile-disbursements', step: 'failure-email' },
          extra: { disbursementId: disb.id },
        });
      }
    }
  }

  return {
    id: disb.id,
    action: 'failed',
    detail: `Paystack status: ${paystackStatus}`,
  };
}
