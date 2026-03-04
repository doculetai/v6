import { ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { universityCopy } from '@/config/copy/university';

const labels = universityCopy.students.tierLabels;

interface UniversityStudentsTierBadgeProps {
  tier: number;
  className?: string;
}

// Tier 0, 1: muted gray — semantic tokens only
// Tier 2: primary accent — semantic tokens only
// Tier 3: delegates to StatusBadge "verified" + ShieldCheck icon
const BADGE_STYLE: Record<number, string> = {
  0: 'bg-muted text-muted-foreground',
  1: 'bg-muted text-muted-foreground',
  2: 'bg-primary/10 text-primary',
};

function tierLabel(tier: number): string {
  if (tier === 0) return labels.none;
  if (tier === 1) return labels.tier1;
  if (tier === 2) return labels.tier2;
  return labels.tier3;
}

export function UniversityStudentsTierBadge({
  tier,
  className,
}: UniversityStudentsTierBadgeProps) {
  const label = tierLabel(tier);

  if (tier === 3) {
    return (
      <span className={cn('inline-flex items-center gap-1', className)}>
        <ShieldCheck
          className="size-3 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <StatusBadge status="verified" label={label} size="sm" />
      </span>
    );
  }

  const style = BADGE_STYLE[tier] ?? BADGE_STYLE[0];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
