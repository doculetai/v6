'use client';

import { CheckCircle, Clock, WarningCircle } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  studentVerificationCopy,
  kycFailureReasonKeys,
  type KycFailureReasonKey,
} from '@/config/copy/student-verification.copy';
import { studentCopy } from '@/config/copy/student';

export type TierStatus = 'complete' | 'active' | 'upcoming' | 'manual_review' | 'failed' | 'error';

type VerificationTierCardProps = {
  tier: 1 | 2 | 3;
  title: string;
  description: string;
  status: TierStatus;
  /** Shown when complete, e.g. "Phone ending in 1234" */
  summaryLine?: string;
  /** Shown when status is active */
  ctaLabel?: string;
  onCta?: () => void;
  /** Shown when status is manual_review */
  manualReviewNote?: string;
  /** Raw failure reason key from server; only used when status is failed */
  failureReason?: string | null;
  /** Number of attempts remaining; only used when status is failed */
  attemptsLeft?: number;
  /** Called when student taps the resubmit button on the failure card */
  onRetryKyc?: () => void;
  /** When true, animate the card open (B2.1 auto-expand) */
  autoExpand?: boolean;
  /** Inline OTP error for T1 (B3.1) */
  otpError?: string | null;
  /** Connected Mono account details for T3 under-review state */
  monoAccount?: {
    bankName: string;
    accountNumberMasked: string;
  } | null;
};

function getFailureReasonText(reason: string | null | undefined): string {
  const copy = studentVerificationCopy.tier2.failure.reasons;
  if (!reason) return copy.default;
  if ((kycFailureReasonKeys as readonly string[]).includes(reason)) {
    return copy[reason as KycFailureReasonKey];
  }
  return copy.default;
}

export function VerificationTierCard({
  tier,
  title,
  description,
  status,
  summaryLine,
  ctaLabel,
  onCta,
  manualReviewNote,
  failureReason,
  attemptsLeft,
  onRetryKyc,
  autoExpand = false,
  otpError,
  monoAccount,
}: VerificationTierCardProps) {
  const isUpcoming = status === 'upcoming';
  const isComplete = status === 'complete';
  const isManualReview = status === 'manual_review';
  const isActive = status === 'active';
  const isFailed = status === 'failed';
  const isError = status === 'error';

  const t2FailureCopy = studentVerificationCopy.tier2.failure;
  const t2ManualCopy = studentVerificationCopy.tier2;

  // B2.1: compact green row for complete status
  if (isComplete) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3',
          'dark:border-success/40 dark:bg-success/10',
          'transition-all duration-150 ease-out',
        )}
      >
        <CheckCircle
          weight="duotone"
          className="size-5 shrink-0 text-success"
          aria-hidden="true"
        />
        <p className="flex-1 text-sm font-medium text-success">
          {title}
          {summaryLine ? (
            <span className="ml-2 font-normal text-success/80">
              &middot; {summaryLine}
            </span>
          ) : null}
        </p>
        <span className="text-xs font-semibold uppercase tracking-wide text-success">
          {studentCopy.tierComplete}
        </span>
      </div>
    );
  }

  // B3.2: amber card for manual_review
  if (isManualReview) {
    const monoReviewCopy = studentCopy.monoReview;
    return (
      <div
        className={cn(
          'rounded-xl border border-warning/30 bg-warning/10 p-5',
          'dark:border-warning/40 dark:bg-warning/15',
          'transition-all duration-150 ease-out',
        )}
      >
        <div className="flex items-start gap-3">
          <Clock
            weight="duotone"
            className="mt-0.5 size-5 shrink-0 text-warning"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-warning">{title}</p>
              <span className="shrink-0 text-xs font-semibold text-warning">
                {studentCopy.t2.manualReview.badge}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-warning/80">
              {manualReviewNote ?? studentCopy.t2.manualReview.note}
            </p>
          </div>
        </div>

        {/* Mono account details when under review */}
        {monoAccount ? (
          <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 p-4 dark:border-warning/40 dark:bg-warning/15">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-warning">
                {monoReviewCopy.badge}
              </span>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-muted-foreground">{monoReviewCopy.bankLabel}</p>
              <p className="text-sm font-medium text-foreground">{monoAccount.bankName}</p>
              <p className="text-xs text-muted-foreground">{monoReviewCopy.accountLabel}</p>
              <p className="font-mono text-sm text-foreground">{monoAccount.accountNumberMasked}</p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{monoReviewCopy.note}</p>
          </div>
        ) : null}
      </div>
    );
  }

  // B3.1: OTP error state — destructive card with retry
  if (isError) {
    const otpErrorCopy = studentCopy.t1.otpError;
    return (
      <div
        className={cn(
          'rounded-xl border border-destructive/30 bg-destructive/5 p-5',
          'transition-all duration-150 ease-out',
        )}
      >
        <div className="flex items-start gap-3">
          <WarningCircle
            weight="duotone"
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{otpErrorCopy.heading}</p>
            {typeof attemptsLeft === 'number' && (
              <p className="text-xs text-muted-foreground">
                {otpErrorCopy.attemptsLeft(attemptsLeft)}
              </p>
            )}
          </div>
        </div>
        {onCta && (
          <Button size="sm" variant="destructive" className="mt-4 min-h-11 w-full" onClick={onCta}>
            {otpErrorCopy.retry}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-5',
        'transition-all duration-150 ease-out',
        isUpcoming && 'opacity-50',
        isActive && 'ring-1 ring-primary/20',
        isFailed && 'ring-1 ring-destructive/30',
        autoExpand && 'animate-in fade-in-0 slide-in-from-top-1',
      )}
    >
      <div className="flex items-start gap-4">
        {/* Tier indicator */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
            isActive
              ? 'bg-primary/10 text-primary'
              : isFailed
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground',
          )}
          aria-hidden="true"
        >
          <span>{tier}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>

          {isFailed ? null : (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}

          {isActive && ctaLabel && onCta && (
            <div className="mt-3 space-y-2">
              <Button size="sm" className="min-h-11" onClick={onCta}>
                {ctaLabel}
              </Button>
              {/* B3.1: inline OTP error */}
              {otpError ? (
                <p className="mt-1.5 text-xs text-destructive" role="alert">
                  {otpError}
                </p>
              ) : null}
            </div>
          )}

          {/* T2 failure card */}
          {isFailed && (
            <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-4 space-y-2">
              <p className="text-sm font-medium text-destructive">
                {t2FailureCopy.title} &middot; {getFailureReasonText(failureReason)} &middot;{' '}
                {t2FailureCopy.action}
              </p>
              {typeof attemptsLeft === 'number' && attemptsLeft > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t2FailureCopy.attemptsLeft(attemptsLeft)}
                </p>
              )}
              {onRetryKyc && (attemptsLeft === undefined || attemptsLeft > 0) && (
                <Button size="sm" className="mt-1" onClick={onRetryKyc}>
                  {t2FailureCopy.resubmitCta}
                </Button>
              )}
            </div>
          )}

          {/* Legacy manual review inline card — dead code path, kept for type safety */}
          {!isManualReview && t2ManualCopy.manualReviewNote && false ? (
            <div className="mt-3 rounded-md border border-warning/30 bg-warning/10 dark:border-warning/40 dark:bg-warning/15 p-4 space-y-1">
              <p className="text-sm font-medium text-warning">
                {t2ManualCopy.manualReviewNote}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
