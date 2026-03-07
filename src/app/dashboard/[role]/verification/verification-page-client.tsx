'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { KycIdentitySheet } from '@/components/student/KycIdentitySheet';
import { PhoneVerificationSheet } from '@/components/student/PhoneVerificationSheet';
import { VerificationTierCard } from '@/components/student/VerificationTierCard';
import {
  PageShell,
  Section,
  Stack,
  PageHeader,
} from '@/components/layout/content-primitives';
import { studentVerificationCopy } from '@/config/copy/student-verification.copy';
import { formatCurrency } from '@/lib/utils';
import { routes } from '@/config/routes';

export type VerificationPageData = {
  phoneVerified: boolean;
  phoneLastFour: string | null;
  kycComplete: boolean;
  kycStatus: 'none' | 'pending' | 'verified' | 'failed' | 'manual_review';
  kycFailedAttempts: number;
  kycFailureReason: string | null;
  bankConnected: boolean;
  bankName: string | null;
  accountNumberMasked: string | null;
  completionPercent: number;
  proofTargetKobo: number | null;
  verifiedAmountKobo: number | null;
};

type VerificationPageClientProps = {
  data: VerificationPageData;
};

export function VerificationPageClient({ data }: VerificationPageClientProps) {
  const copy = studentVerificationCopy;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phoneOpen, setPhoneOpen] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);

  // Open KYC sheet via ?action=verify
  useEffect(() => {
    if (searchParams.get('action') === 'verify' && data.phoneVerified) {
      setKycOpen(true);
    }
  }, [searchParams, data.phoneVerified]);

  const handlePhoneVerified = useCallback(() => {
    setPhoneOpen(false);
    router.refresh();
  }, [router]);

  const handleKycSuccess = useCallback(() => {
    setKycOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('action');
    window.history.replaceState({}, '', url.pathname);
    router.refresh();
  }, [router]);

  // Derive tier statuses
  const t1Status = data.phoneVerified ? 'complete' : 'active';

  const t2Status: 'complete' | 'active' | 'upcoming' | 'manual_review' | 'failed' =
    !data.phoneVerified
      ? 'upcoming'
      : data.kycStatus === 'manual_review'
        ? 'manual_review'
        : data.kycStatus === 'failed'
          ? 'failed'
          : data.kycComplete
            ? 'complete'
            : 'active';

  const MAX_KYC_ATTEMPTS = 3;
  const kycAttemptsLeft =
    data.kycStatus === 'failed'
      ? Math.max(0, MAX_KYC_ATTEMPTS - data.kycFailedAttempts)
      : undefined;

  const t3Status: 'complete' | 'active' | 'upcoming' = !data.kycComplete
    ? 'upcoming'
    : data.bankConnected
      ? 'complete'
      : 'active';

  // Proof target progress bar
  const hasTarget = data.proofTargetKobo != null && data.proofTargetKobo > 0;
  const targetLabel = hasTarget
    ? copy.proofTarget.label(
        formatCurrency((data.verifiedAmountKobo ?? 0) / 100),
        formatCurrency(data.proofTargetKobo! / 100),
      )
    : null;

  return (
    <PageShell width="narrow">
      <Section>
        <PageHeader title={copy.title} description={copy.description} />

        {/* Proof target progress bar */}
        {hasTarget && (
          <Stack gap="xs">
            <div className="text-xs text-muted-foreground">{targetLabel}</div>
            <div
              className="h-2 rounded-full bg-muted overflow-hidden"
              role="progressbar"
              aria-valuenow={data.completionPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={targetLabel ?? 'Verification progress'}
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(data.completionPercent, 100)}%` }}
              />
            </div>
          </Stack>
        )}

        {/* Tier cards */}
        <Stack gap="sm">
          <VerificationTierCard
            tier={1}
            title={copy.tier1.title}
            description={copy.tier1.description}
            status={t1Status}
            summaryLine={
              data.phoneVerified
                ? data.phoneLastFour
                  ? copy.tier1.completedSummary(data.phoneLastFour)
                  : copy.tier1.completedGeneric
                : undefined
            }
            ctaLabel={copy.tier1.cta}
            onCta={() => setPhoneOpen(true)}
          />

          <VerificationTierCard
            tier={2}
            title={copy.tier2.title}
            description={copy.tier2.description}
            status={t2Status}
            summaryLine={data.kycComplete ? copy.tier2.completedSummary : undefined}
            ctaLabel={copy.tier2.cta}
            onCta={() => setKycOpen(true)}
            manualReviewNote={copy.tier2.manualReviewNote}
            failureReason={data.kycFailureReason}
            attemptsLeft={kycAttemptsLeft}
            onRetryKyc={t2Status === 'failed' ? () => setKycOpen(true) : undefined}
          />

          <VerificationTierCard
            tier={3}
            title={copy.tier3.title}
            description={copy.tier3.description}
            status={t3Status}
            summaryLine={
              data.bankConnected && data.bankName && data.accountNumberMasked
                ? copy.tier3.completedSummary(data.bankName, data.accountNumberMasked)
                : undefined
            }
            ctaLabel={copy.tier3.cta}
            onCta={() => router.push(routes.dashboard.student.documentsBank)}
          />
        </Stack>
      </Section>

      <PhoneVerificationSheet
        open={phoneOpen}
        onOpenChange={setPhoneOpen}
        onVerified={handlePhoneVerified}
      />
      <KycIdentitySheet
        open={kycOpen}
        onOpenChange={setKycOpen}
        onSuccess={handleKycSuccess}
        failedAttempts={data.kycFailedAttempts}
      />
    </PageShell>
  );
}
