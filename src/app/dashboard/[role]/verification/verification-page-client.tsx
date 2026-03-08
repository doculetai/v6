'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { KycIdentitySheet } from '@/components/student/KycIdentitySheet';
import { PhoneVerificationSheet } from '@/components/student/PhoneVerificationSheet';
import { VerificationTierCard } from '@/components/student/VerificationTierCard';
import {
  Grid,
  PageShell,
  Section,
  Stack,
  PageHeader,
  BlockedStateCard,
} from '@/components/layout/content-primitives';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { studentVerificationCopy } from '@/config/copy/student-verification.copy';
import { studentCopy } from '@/config/copy/student';
import { formatCurrency } from '@/lib/utils';
import { routes } from '@/config/routes';

export type VerificationPageData = {
  /** B5.1: when false, show blocked state. Defaults to true if omitted. */
  onboardingComplete?: boolean;
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
  /** T3 rejection note from admin — shown above choice grid */
  t3RejectionNote?: string | null;
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
  // B4.1: T3 path selection
  const [t3Path, setT3Path] = useState<'choice' | 'mono' | 'upload'>('choice');
  // B3.3: dismiss rejection note once user starts new submission
  const [t3RejectionDismissed, setT3RejectionDismissed] = useState(false);

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

  // B2.1: T2 auto-expands when T1 just completed
  const t2AutoExpand = data.phoneVerified && t2Status === 'active';

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

  const showT3Rejection =
    !t3RejectionDismissed && Boolean(data.t3RejectionNote);

  // B5.1: blocked state when onboarding not complete (defaults to true — page.tsx handles this too)
  if (data.onboardingComplete === false) {
    return (
      <PageShell width="narrow">
        <Section>
          <PageHeader title={copy.title} description={copy.description} />
          <BlockedStateCard
            heading={studentCopy.blockedStates.verification.heading}
            body={studentCopy.blockedStates.verification.body}
            action={{
              label: studentCopy.blockedStates.verification.cta,
              href: routes.dashboard.student.onboarding,
            }}
          />
        </Section>
      </PageShell>
    );
  }

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
            autoExpand={t2AutoExpand}
          />

          {/* T3: show choice cards when active, or completed summary */}
          {t3Status === 'active' ? (
            <div className="rounded-xl border bg-card p-5 space-y-4 transition-all duration-150 ease-out">
              <p className="text-sm font-semibold text-foreground">{copy.tier3.title}</p>
              <p className="text-sm text-muted-foreground">{copy.tier3.description}</p>

              {/* B3.3: T3 rejection note above choice grid */}
              {showT3Rejection && data.t3RejectionNote ? (
                <Callout variant="warning">
                  {studentCopy.rejectedPrefix}{data.t3RejectionNote}
                </Callout>
              ) : null}

              {/* B4.1: equal side-by-side choice cards */}
              <Grid cols={{ sm: 2 }} gap="md">
                {/* Option A: Connect bank (Mono) */}
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {studentCopy.t3Choice.optionA.label}
                    </p>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {studentCopy.t3Choice.optionA.badge}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    {studentCopy.t3Choice.optionA.description}
                  </p>
                  <Button
                    type="button"
                    className="min-h-11 w-full"
                    onClick={() => {
                      setT3Path('mono');
                      setT3RejectionDismissed(true);
                    }}
                  >
                    {studentCopy.t3Choice.optionA.cta}
                  </Button>
                </div>

                {/* Option B: Upload bank statement */}
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold text-foreground">
                    {studentCopy.t3Choice.optionB.label}
                  </p>
                  <p className="text-sm text-muted-foreground flex-1">
                    {studentCopy.t3Choice.optionB.description}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 w-full"
                    onClick={() => {
                      router.push(routes.dashboard.student.documentsBank);
                      setT3RejectionDismissed(true);
                    }}
                  >
                    {studentCopy.t3Choice.optionB.cta}
                  </Button>
                </div>
              </Grid>

              {/* Mono path selected: redirect to documents#bank */}
              {t3Path === 'mono' ? null : null}
            </div>
          ) : (
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
          )}
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
