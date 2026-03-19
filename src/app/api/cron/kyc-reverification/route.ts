import { captureException } from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { and, eq, isNotNull, lt, max } from 'drizzle-orm';

import { db } from '@/db';
import {
  bankAccounts,
  kycVerifications,
  notifications,
  studentProfiles,
} from '@/db/schema';

/** KYC verified older than this (days) triggers re-verification reminder */
const KYC_EXPIRY_DAYS = 365;
/** Bank linked older than this (days) triggers re-connect reminder */
const BANK_EXPIRY_DAYS = 75;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const kycThreshold = new Date(
      Date.now() - KYC_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );
    const bankThreshold = new Date(
      Date.now() - BANK_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    const staleKycByUser = await db
      .select({
        userId: kycVerifications.userId,
        maxVerifiedAt: max(kycVerifications.verifiedAt),
      })
      .from(kycVerifications)
      .where(
        and(
          eq(kycVerifications.status, 'verified'),
          isNotNull(kycVerifications.verifiedAt),
        ),
      )
      .groupBy(kycVerifications.userId);

    const staleKyc = staleKycByUser.filter(
      (r) => r.maxVerifiedAt && r.maxVerifiedAt < kycThreshold,
    );

    const staleBank = await db
      .select({ userId: bankAccounts.userId })
      .from(bankAccounts)
      .where(lt(bankAccounts.linkedAt, bankThreshold))
      .limit(500);

    const kycUserIds = staleKyc.map((r) => r.userId);
    const bankUserIds = [...new Set(staleBank.map((r) => r.userId))];

    for (const userId of kycUserIds) {
      await db
        .update(studentProfiles)
        .set({ kycStatus: 'pending', updatedAt: new Date() })
        .where(eq(studentProfiles.userId, userId));
      await db.insert(notifications).values({
        userId,
        type: 'kyc_reminder',
        title: 'KYC re-verification required',
        body: 'Your identity verification has expired. Please complete verification again.',
        metaJson: { reason: 'expiry' },
      });
    }

    for (const userId of bankUserIds) {
      await db
        .update(studentProfiles)
        .set({ bankStatus: 'pending', updatedAt: new Date() })
        .where(eq(studentProfiles.userId, userId));
      await db.insert(notifications).values({
        userId,
        type: 'kyc_reminder',
        title: 'Bank connection expiring',
        body: 'Your bank connection needs to be reconnected for continued verification.',
        metaJson: { reason: 'bank_expiry' },
      });
    }

    return NextResponse.json({
      ok: true,
      kycExpiredCount: kycUserIds.length,
      bankExpiredCount: bankUserIds.length,
    });
  } catch (err) {
    captureException(err, { tags: { cron: 'kyc-reverification' } });
    return NextResponse.json(
      { error: 'KYC re-verification cron failed' },
      { status: 500 },
    );
  }
}
