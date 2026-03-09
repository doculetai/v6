import { cn } from '@/lib/utils';

type UsageMeterProps = {
  used: number;
  limit: number;
  className?: string;
};

export function UsageMeter({ used, limit, className }: UsageMeterProps) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isHigh = pct >= 80;

  return (
    <div className={cn('space-y-1', className)}>
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(pct)}% of daily API limit used`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isHigh ? 'bg-warning' : 'bg-primary/60',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={cn('font-mono text-[10px] tabular-nums', isHigh ? 'text-warning' : 'text-muted-foreground')}>
        {used.toLocaleString()} / {limit.toLocaleString()}
      </p>
    </div>
  );
}
