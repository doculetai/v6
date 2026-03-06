'use client';

import { CheckCircle } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type TierStatus = 'complete' | 'active' | 'upcoming' | 'manual_review';

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
};

export function VerificationTierCard({
  tier,
  title,
  description,
  status,
  summaryLine,
  ctaLabel,
  onCta,
  manualReviewNote,
}: VerificationTierCardProps) {
  const isUpcoming = status === 'upcoming';
  const isComplete = status === 'complete';
  const isManualReview = status === 'manual_review';
  const isActive = status === 'active';

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-5 transition-opacity duration-200',
        isUpcoming && 'opacity-50',
        isActive && 'ring-1 ring-primary/20',
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
          ) : isManualReview ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {manualReviewNote ??
                'Your identity is under manual review. We will notify you when it is complete.'}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}

          {isActive && ctaLabel && onCta && (
            <Button size="sm" className="mt-3" onClick={onCta}>
              {ctaLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
