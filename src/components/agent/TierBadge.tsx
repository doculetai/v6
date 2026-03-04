import { ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';

interface TierBadgeProps {
  tier: 1 | 2 | 3;
  className?: string;
}

const TIER_STYLES: Record<1 | 2 | 3, string> = {
  1: 'bg-muted text-muted-foreground',
  2: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
  3: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
};

function TierBadge({ tier, className }: TierBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        TIER_STYLES[tier],
        className,
      )}
    >
      {tier === 3 ? <ShieldCheck className="size-3" aria-hidden="true" /> : null}
      {`Tier ${tier}`}
    </span>
  );
}

export { TierBadge };
export type { TierBadgeProps };
