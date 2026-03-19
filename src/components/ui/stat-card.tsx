import Link from 'next/link';

import { TrendDown, TrendUp } from '@/components/icons';
import { cn } from '@/lib/utils';

interface StatCardDelta {
  value: string;
  direction: 'up' | 'down' | 'neutral';
}

interface StatCardProps {
  label: string;
  value: string | number;
  /** Alias: `sub` and `subValue` are interchangeable. */
  sub?: string;
  subValue?: string;
  delta?: StatCardDelta;
  mono?: boolean;
  /** Secondary FX display line (e.g. USD equivalent). */
  fx?: string;
  /** When true, applies role-accent border tint to signal active/progress state. */
  accent?: boolean;
  /** When provided, wraps the entire card in a Next.js Link. */
  href?: string;
  /** Additional className for the value `<p>` element. */
  valueClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  sub,
  subValue,
  delta,
  mono,
  fx,
  accent,
  href,
  valueClassName,
  className,
  children,
}: StatCardProps) {
  const resolvedSub = sub ?? subValue;
  const cardClassName = cn(
    'rounded-xl border bg-card px-4 py-[18px] shadow-xs',
    accent ? 'border-primary/40' : 'border-border',
    href && 'transition-colors hover:border-primary/60',
    className,
  );

  const content = (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
        {label}
      </p>
      <p className={cn('mt-2 text-2xl font-bold tracking-[-0.025em] text-foreground', mono && 'font-mono', valueClassName)}>
        {value}
      </p>
      {resolvedSub ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{resolvedSub}</p>
      ) : null}
      {fx ? (
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{fx}</p>
      ) : null}
      {delta ? (
        <div
          className={cn('mt-1 flex items-center gap-1 text-xs font-medium', {
            'text-success': delta.direction === 'up',
            'text-destructive': delta.direction === 'down',
            'text-muted-foreground': delta.direction === 'neutral',
          })}
        >
          {delta.direction === 'up' ? <TrendUp size={16} weight="duotone" /> : null}
          {delta.direction === 'down' ? <TrendDown size={16} weight="duotone" /> : null}
          {delta.value}
        </div>
      ) : null}
      {children}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(cardClassName, 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2')}
      >
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}

export type { StatCardProps, StatCardDelta };
