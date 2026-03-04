import { ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';

interface TierBadgeProps {
  tier: number;
  label: string;
  className?: string;
}

const TIER_STYLES: Record<number, string> = {
  1: 'bg-muted text-muted-foreground',
  2: 'bg-secondary text-secondary-foreground',
  3: 'bg-accent text-accent-foreground',
};

function TierBadge({ tier, label, className }: TierBadgeProps) {
  const style = TIER_STYLES[tier] ?? TIER_STYLES[1];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        style,
        className,
      )}
    >
      {tier === 3 ? <ShieldCheck className="size-3 shrink-0" aria-hidden="true" /> : null}
      {label}
    </span>
  );
}

export { TierBadge };
export type { TierBadgeProps };
