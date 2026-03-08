import { TrendDown, TrendUp } from '@/components/icons';
import { cn } from '@/lib/utils';

interface StatCardDelta {
  value: string;
  direction: 'up' | 'down' | 'neutral';
}

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  delta?: StatCardDelta;
  mono?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  subValue,
  delta,
  mono,
  className,
  children,
}: StatCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card px-4 py-[18px] shadow-sm', className)}>
      <p className="text-[10px] font-bold uppercase tracking-[0.09em] text-slate-400">
        {label}
      </p>
      <p className={cn('mt-2 text-2xl font-bold tracking-tight text-foreground', mono && 'font-mono')}>
        {value}
      </p>
      {subValue ? (
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{subValue}</p>
      ) : null}
      {delta ? (
        <div
          className={cn('mt-1 flex items-center gap-1 text-xs font-medium', {
            'text-green-600 dark:text-green-400': delta.direction === 'up',
            'text-destructive': delta.direction === 'down',
            'text-muted-foreground': delta.direction === 'neutral',
          })}
        >
          {delta.direction === 'up' ? <TrendUp size={12} weight="duotone" /> : null}
          {delta.direction === 'down' ? <TrendDown size={12} weight="duotone" /> : null}
          {delta.value}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export type { StatCardProps, StatCardDelta };
