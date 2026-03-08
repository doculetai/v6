import { cn } from '@/lib/utils';

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

const copy = {
  prefix: 'Rate: $1 = ₦ ',
  updated: 'Updated',
  stalePrefix: 'Rate may be outdated · Last updated',
} as const;

export function FxRateInline({ rateNgnPerUsd, updatedAt, className }: FxRateInlineProps) {
  const stale = Date.now() - updatedAt.getTime() > 86_400_000; // >24h
  const formattedRate = new Intl.NumberFormat('en-NG').format(rateNgnPerUsd);
  const timeAgo = formatTimeAgo(updatedAt);

  return (
    <p
      className={cn(
        'font-mono text-[11px]',
        stale ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground/70',
        className,
      )}
    >
      {stale ? copy.stalePrefix : `${copy.prefix}${formattedRate}`}
      {' · '}
      {copy.updated} {timeAgo}
    </p>
  );
}

export type { FxRateInlineProps };
