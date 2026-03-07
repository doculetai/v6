'use client';

import { CheckCircle } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  studentVerificationCopy,
  kycFailureReasonKeys,
  type KycFailureReasonKey,
} from '@/config/copy/student-verification.copy';

export type TierStatus = 'complete' | 'active' | 'upcoming' | 'manual_review' | 'failed';

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
}: VerificationTierCardProps) {
  const isUpcoming = status === 'upcoming';
  const isComplete = status === 'complete';
  const isManualReview = status === 'manual_review';
  const isActive = status === 'active';
  const isFailed = status === 'failed';

  const t2FailureCopy = studentVerificationCopy.tier2.failure;
  const t2ManualCopy = studentVerificationCopy.tier2;

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-5 transition-opacity duration-200',
        isUpcoming && 'opacity-50',
        isActive && 'ring-1 ring-primary/20',
        isFailed && 'ring-1 ring-destructive/30',
      )}
    >
      <div className="flex items-start gap-4">
        {/* Tier indicator */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
            isComplete
              ? 'bg-primary/10 text-primary'
              : isActive
                ? 'bg-primary/10 text-primary'
                : isFailed
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted text-muted-foreground',
          )}
          aria-hidden="true"
        >
          {isComplete ? (
            <CheckCircle className="size-4" weight="duotone" />
          ) : (
            <span>{tier}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>

          {isComplete && summaryLine ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{summaryLine}</p>
          ) : isManualReview ? null : isFailed ? null : (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}

          {isActive && ctaLabel && onCta && (
            <Button size="sm" className="mt-3 min-h-11" onClick={onCta}>
              {ctaLabel}
            </Button>
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

          {/* T2 manual review card */}
          {isManualReview && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30 p-4 space-y-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {t2ManualCopy.manualReviewNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
