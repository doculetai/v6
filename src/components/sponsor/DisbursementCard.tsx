import { CalendarClock, Hash, LoaderCircle, UserRound } from 'lucide-react';

import { MoneyValue } from '@/components/ui/money-value';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import { Button } from '@/components/ui/button';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';

import { DisbursementStatusBadge } from './DisbursementStatusBadge';
import type { SponsorDisbursement } from './disbursement-types';

type DisbursementCardLayout = 'card' | 'row';

type DisbursementCardProps = {
  disbursement: SponsorDisbursement;
  layout?: DisbursementCardLayout;
  isCancelling?: boolean;
  onCancel?: (disbursementId: string) => void;
};

function AmountLabel({ amountKobo }: { amountKobo: number }) {
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
      <span aria-hidden="true">₦</span>
      <MoneyValue amountMinor={amountKobo} showCode={false} className="text-base" />
    </span>
  );
}

function canCancel(status: SponsorDisbursement['status']) {
  return status === 'pending' || status === 'processing';
}

export function DisbursementCard({
  disbursement,
  layout = 'card',
  isCancelling = false,
  onCancel,
}: DisbursementCardProps) {
  const cancelVisible = Boolean(onCancel && canCancel(disbursement.status));
  const referenceLabel = disbursement.paystackReference ?? sponsorCopy.disbursements.table.unavailable;

  if (layout === 'row') {
    return (
      <div className="grid grid-cols-[1.35fr_1fr_1fr_1fr_1fr_auto] items-center gap-3 border-b border-border/60 px-4 py-3.5 text-sm last:border-b-0">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{disbursement.studentDisplayName}</p>
          <p className="truncate text-xs text-muted-foreground">{disbursement.studentEmail}</p>
        </div>
        <AmountLabel amountKobo={disbursement.amountKobo} />
        <TimestampLabel value={disbursement.scheduledAt} className="text-xs" />
        <DisbursementStatusBadge status={disbursement.status} />
        <p className="truncate font-mono text-xs text-muted-foreground">{referenceLabel}</p>
        {cancelVisible ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-11 min-w-11 px-3"
            onClick={() => onCancel?.(disbursement.id)}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              sponsorCopy.disbursements.actions.cancel
            )}
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">
            {sponsorCopy.disbursements.table.unavailable}
          </span>
        )}
      </div>
    );
  }

  return (
    <article className="rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm dark:border-border dark:bg-card/90">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserRound className="size-5 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">{disbursement.studentDisplayName}</span>
          </p>
          <p className="truncate text-xs text-muted-foreground">{disbursement.studentEmail}</p>
        </div>
        <DisbursementStatusBadge status={disbursement.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-background/60 p-3 dark:bg-background/40">
          <p className="text-xs text-muted-foreground">{sponsorCopy.disbursements.table.amount}</p>
          <AmountLabel amountKobo={disbursement.amountKobo} />
        </div>
        <div className="rounded-lg border border-border/60 bg-background/60 p-3 dark:bg-background/40">
          <p className="text-xs text-muted-foreground">{sponsorCopy.disbursements.table.scheduledDate}</p>
          <p className="inline-flex items-center gap-2 text-xs text-foreground">
            <CalendarClock className="size-4 text-muted-foreground" aria-hidden="true" />
            <TimestampLabel value={disbursement.scheduledAt} className="text-xs" />
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/60 p-3 dark:bg-background/40">
          <p className="text-xs text-muted-foreground">{sponsorCopy.disbursements.table.updatedDate}</p>
          <TimestampLabel value={disbursement.updatedAt} className="text-xs" />
        </div>
        <div className="rounded-lg border border-border/60 bg-background/60 p-3 dark:bg-background/40">
          <p className="text-xs text-muted-foreground">{sponsorCopy.disbursements.table.reference}</p>
          <p className={cn('inline-flex items-center gap-2 font-mono text-xs text-foreground')}>
            <Hash className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">{referenceLabel}</span>
          </p>
        </div>
      </div>

      {cancelVisible ? (
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            onClick={() => onCancel?.(disbursement.id)}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                {sponsorCopy.disbursements.actions.cancel}
              </span>
            ) : (
              sponsorCopy.disbursements.actions.cancel
            )}
          </Button>
        </div>
      ) : null}
    </article>
  );
}
