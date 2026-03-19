import { TrendUp } from '@/components/icons';
import { sharedCopy } from '@/config/copy/shared';

type FxRateCardProps = {
  rateX100: number | null;
  fetchedAt: Date | null;
  source: string | null;
};

const copy = sharedCopy.fxRate;

export function FxRateCard({ rateX100, fetchedAt, source }: FxRateCardProps) {
  if (rateX100 === null) {
    return (
      <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-xs">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {copy.label}
        </p>
        <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-muted-foreground">
          {copy.unavailable}
        </p>
      </div>
    );
  }

  const rate = (rateX100 / 100).toFixed(2);
  const formattedDate = fetchedAt
    ? new Intl.DateTimeFormat('en-NG', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(fetchedAt))
    : null;

  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {copy.label}
        </p>
        <TrendUp className="size-4 text-primary/60" weight="duotone" aria-hidden="true" />
      </div>
      <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground">
        {rate}
      </p>
      <div className="mt-1.5 space-y-0.5">
        {formattedDate && (
          <p className="text-xs text-muted-foreground">{copy.updatedAt(formattedDate)}</p>
        )}
        {source && (
          <p className="text-xs text-muted-foreground">{copy.source(source)}</p>
        )}
      </div>
    </div>
  );
}
