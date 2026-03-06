import { notFound } from 'next/navigation';

import { api } from '@/trpc/server';

import { VerificationPageClient } from './verification-page-client';
import type { VerificationPageData } from './verification-page-client';

export const metadata = { title: 'Identity Verification — Doculet' };

type Props = { params: Promise<{ role: string }> };

export default async function VerificationPage({ params }: Props) {
  const { role } = await params;
  if (role !== 'student') notFound();

  const caller = await api();
  const [verificationResult, balanceResult] = await Promise.allSettled([
    caller.student.getVerificationStatus(),
    caller.student.getBalanceStatus(),
  ]);

  const v = verificationResult.status === 'fulfilled' ? verificationResult.value : null;
  const balance = balanceResult.status === 'fulfilled' ? balanceResult.value : null;

  const t1Complete = Boolean(v?.tiers.find((t) => t.tier === 1)?.isComplete);
  const t2Complete = Boolean(v?.tiers.find((t) => t.tier === 2)?.isComplete);

  const kycStatus: VerificationPageData['kycStatus'] =
    !v
      ? 'none'
      : v.kycFailedAttempts >= 3 && !t2Complete
        ? 'manual_review'
        : v.latestDojahCheck.status === 'verified'
          ? 'verified'
          : v.latestDojahCheck.status === 'failed'
            ? 'failed'
            : v.latestDojahCheck.status === 'pending'
              ? 'pending'
              : 'none';

  const data: VerificationPageData = {
    phoneVerified: t1Complete,
    phoneLastFour: null, // not exposed in current schema
    kycComplete: t2Complete,
    kycStatus,
    kycFailedAttempts: v?.kycFailedAttempts ?? 0,
    bankConnected: v?.monoConnection.isConnected ?? false,
    bankName: v?.monoConnection.bankName ?? null,
    accountNumberMasked: v?.monoConnection.accountNumberMasked ?? null,
    completionPercent: v?.completionPercent ?? 0,
    proofTargetKobo: null, // proof target not yet exposed — add when available
    verifiedAmountKobo:
      balance?.hasVerifiedBalance && balance.verifiedAmountKobo != null
        ? balance.verifiedAmountKobo
        : null,
  };

  return (
    <>
      <h1 className="sr-only">Identity Verification</h1>
      <VerificationPageClient data={data} />
    </>
  );
}
