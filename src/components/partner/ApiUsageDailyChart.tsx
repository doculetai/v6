import { cn } from '@/lib/utils';
import { partnerCopy } from '@/config/copy/partner';

interface DailyCallDatum {
  date: string;
  calls: number;
}

interface ApiUsageDailyChartProps {
  data: DailyCallDatum[];
  className?: string;
}

const copy = partnerCopy.analytics.chart;

/** Formats ISO date "2025-03-04" → "Mar 4" */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Indices of bars that should show x-axis labels (first, mid, last of 30) */
const LABEL_INDICES = new Set([0, 9, 19, 29]);

export function ApiUsageDailyChart({ data, className }: ApiUsageDailyChartProps) {
  const maxCalls = data.length > 0 ? Math.max(...data.map((d) => d.calls)) : 0;

  if (maxCalls <= 0) {
    return (
      <div
        className={cn(
          'flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-card',
          className,
        )}
      >
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-xl border bg-card p-4', className)}
      role="img"
      aria-label={copy.title}
    >
      {/* Bar area */}
      <div className="flex h-24 items-end gap-px" aria-hidden="true">
        {data.map(({ date, calls }) => {
          // CSS custom property used for dynamic bar height — necessary for
          // a data-driven chart where Tailwind can't generate arbitrary runtime values.
          const barStyle = { '--bar-h': `${(calls / maxCalls) * 100}%` } as React.CSSProperties;
          return (
            <div key={date} className="group relative min-w-0 flex-1" title={`${formatDate(date)}: ${calls} calls`}>
              <div
                className="absolute inset-x-0 bottom-0 h-[var(--bar-h)] rounded-t-sm bg-primary/50 transition-colors duration-150 group-hover:bg-primary"
                style={barStyle}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis: show labels at key positions */}
      <div className="mt-1 flex gap-px">
        {data.map(({ date }, i) => (
          <div key={date} className="min-w-0 flex-1 text-center">
            {LABEL_INDICES.has(i) ? (
              <span className="text-[9px] leading-none text-muted-foreground">
                {formatDate(date)}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
