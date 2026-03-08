import { cn } from '@/lib/utils';
import { sharedCopy } from '@/config/copy/shared';

function formatTimeAgo(date: Date): string {
  const h = Math.floor((Date.now() - date.getTime()) / 3_600_000);
  if (h < 1) return 'just now';
  if (h === 1) return '1h ago';
  return `${h}h ago`;
}

interface FxRateInlineProps {
  rateNgnPerUsd: number;
  updatedAt: Date;
  className?: string;
}

export function FxRateInline({ rateNgnPerUsd, updatedAt, className }: FxRateInlineProps) {
  const copy = sharedCopy.fxRateInline;
  const stale = Date.now() - updatedAt.getTime() > 86_400_000; // >24h
  const formattedRate = new Intl.NumberFormat('en-NG').format(rateNgnPerUsd);
  const timeAgo = formatTimeAgo(updatedAt);

  return (
    <p
      className={cn(
        'font-mono text-xs',
        stale ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
        className,
      )}
    >
      {stale ? copy.stalePrefix : copy.prefix}
      {!stale && `₦ ${formattedRate}`}
      {' · '}
      {copy.updated} {timeAgo}
    </p>
  );
}

export type { FxRateInlineProps };
