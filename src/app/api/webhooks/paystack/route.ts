import { captureException } from '@sentry/nextjs';
import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { certificatePayments, certificates, disbursementFees } from '@/db/schema';
import { disbursements, sponsorships, users } from '@/db/schema';
import {
  calculateFee,
  getActiveFeeConfig,
} from '@/db/queries/platform-fees';
import { insertAuditLog } from '@/db/queries/audit-log';
import { processPaystackWebhook } from '@/db/queries/paystack-webhook';
import { insertTransaction } from '@/db/queries/transactions';
import { sendDisbursementFailedEmail } from '@/lib/email/send-disbursement-failed-email';
import { enqueueWebhooks } from '@/lib/outbound-webhooks';

const DOCULET_PREFIX = 'DOCULET-';
const CERT_PAY_PREFIX = 'cert-pay-';

function verifyPaystackSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;
  const expected = createHmac('sha512', secret).update(rawBody).digest();
  try {
    const sigBuf = Buffer.from(signature, 'hex');
    if (expected.length !== sigBuf.length) return false;
    return timingSafeEqual(expected, sigBuf);
  } catch {
    return false;
  }
}

const paystackTransferEventSchema = z.enum([
  'transfer.success',
  'transfer.failed',
  'transfer.reversed',
]);

const paystackTransferPayloadSchema = z.object({
  event: paystackTransferEventSchema,
  data: z.object({
    reference: z.string(),
  }),
});

const paystackChargePayloadSchema = z.object({
  event: z.literal('charge.success'),
  data: z.object({
    reference: z.string(),
    amount: z.number(), // amount in kobo from Paystack
  }),
});

const paystackPayloadSchema = z.union([
  paystackTransferPayloadSchema,
  paystackChargePayloadSchema,
]);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: z.infer<typeof paystackPayloadSchema>;
  try {
    const parsed = paystackPayloadSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      return NextResponse.json({ received: true }); // ignore unrecognised events
    }
    payload = parsed.data;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event, data } = payload;
  const reference = data.reference;

  // Handle certificate payment charge events
  if (event === 'charge.success' && reference.startsWith(CERT_PAY_PREFIX)) {
    const paystackAmountKobo = (data as { reference: string; amount: number }).amount;
    try {
      const payment = await db.query.certificatePayments.findFirst({
        where: eq(certificatePayments.paystackReference, reference),
      });

      if (!payment) {
        // Unknown reference — acknowledge without error
        return NextResponse.json({ received: true });
      }

      // Idempotency: already processed
      if (payment.status === 'paid') {
        return NextResponse.json({ received: true });
      }

      // Verify the amount Paystack reports matches what we expect
      if (paystackAmountKobo !== payment.amountKobo) {
        captureException(
          new Error(
            `cert-pay amount mismatch: expected ${payment.amountKobo}, got ${paystackAmountKobo} for reference ${reference}`,
          ),
          { tags: { webhook: 'paystack', event: 'charge.success' } },
        );
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

      const now = new Date();

      // Update certificate_payments row
      await db
        .update(certificatePayments)
        .set({ status: 'paid', paidAt: now, updatedAt: now })
        .where(
          and(
            eq(certificatePayments.id, payment.id),
            eq(certificatePayments.status, 'pending'),
          ),
        );

      // Update certificate paymentStatus
      await db
        .update(certificates)
        .set({ paymentStatus: 'paid' })
        .where(eq(certificates.id, payment.certificateId));

      await insertAuditLog(db, {
        actorId: payment.studentId,
        action: 'certificate.paid',
        entityType: 'certificate',
        entityId: payment.certificateId,
        meta: { reference, amountKobo: payment.amountKobo, source: 'webhook' },
      });
    } catch (error) {
      captureException(error, { tags: { webhook: 'paystack', event: 'charge.success' } });
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  }

  try {
    const disbursement = await processPaystackWebhook(db, reference, event as z.infer<typeof paystackTransferEventSchema>);

    if (disbursement && event === 'transfer.success') {
      const [sponsorship] = await db
        .select({
          studentId: sponsorships.studentId,
          currency: sponsorships.currency,
        })
        .from(sponsorships)
        .where(eq(sponsorships.id, disbursement.sponsorshipId))
        .limit(1);

      await insertTransaction(db, {
        type: 'disbursement',
        entityType: 'disbursement',
        entityId: disbursement.id,
        amountKobo: disbursement.amountKobo,
        currency: sponsorship?.currency ?? 'NGN',
        userId: sponsorship?.studentId ?? null,
        meta: JSON.stringify({ sponsorshipId: disbursement.sponsorshipId }),
      });

      // Record platform fee if any
      const currency = sponsorship?.currency ?? 'NGN';
      const feeConfig = await getActiveFeeConfig(db, currency);
      const feeKobo = calculateFee(disbursement.amountKobo, feeConfig);
      if (feeKobo > 0) {
        await db.insert(disbursementFees).values({
          disbursementId: disbursement.id,
          amountKobo: feeKobo,
          currency,
        });
        await insertTransaction(db, {
          type: 'platform_fee',
          entityType: 'disbursement',
          entityId: disbursement.id,
          amountKobo: feeKobo,
          currency,
          meta: JSON.stringify({ sponsorshipId: disbursement.sponsorshipId }),
        });
      }

      if (sponsorship) {
        try {
          await enqueueWebhooks('disbursement.disbursed', {
            disbursementId: disbursement.id,
            studentId: sponsorship.studentId,
            sponsorshipId: disbursement.sponsorshipId,
            amountKobo: disbursement.amountKobo,
            currency: sponsorship.currency,
            disbursedAt: disbursement.disbursedAt?.toISOString(),
          });
        } catch {
          // Logged; do not fail webhook response
        }
      }
    }

    if ((event === 'transfer.failed' || event === 'transfer.reversed') && disbursement === null) {
      const disbId = reference.startsWith(DOCULET_PREFIX) ? reference.slice(DOCULET_PREFIX.length) : null;
      const [row] = await db
        .select({
          id: disbursements.id,
          amountKobo: disbursements.amountKobo,
          sponsorshipId: disbursements.sponsorshipId,
          status: disbursements.status,
        })
        .from(disbursements)
        .where(
          disbId
            ? eq(disbursements.id, disbId)
            : eq(disbursements.paystackReference, reference),
        )
        .limit(1);

      if (row && row.status === 'failed') {
        const [sponsorship] = await db
          .select({
            sponsorId: sponsorships.sponsorId,
            currency: sponsorships.currency,
          })
          .from(sponsorships)
          .where(eq(sponsorships.id, row.sponsorshipId))
          .limit(1);

        await insertTransaction(db, {
          type: 'disbursement',
          entityType: 'disbursement',
          entityId: row.id,
          amountKobo: row.amountKobo,
          currency: sponsorship?.currency ?? 'NGN',
          userId: sponsorship?.sponsorId ?? null,
          meta: JSON.stringify({
            sponsorshipId: row.sponsorshipId,
            event: event === 'transfer.reversed' ? 'reversed' : 'failed',
          }),
        });

        if (sponsorship) {
          const [sponsorUser] = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, sponsorship.sponsorId))
            .limit(1);

          if (sponsorUser?.email) {
            try {
              await sendDisbursementFailedEmail({
                toEmail: sponsorUser.email,
                amountKobo: row.amountKobo,
                currency: sponsorship.currency,
              });
            } catch {
              // Logged; do not fail webhook response
            }
          }
        }
      }
    }
  } catch (error) {
    captureException(error, { tags: { webhook: 'paystack' } });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
