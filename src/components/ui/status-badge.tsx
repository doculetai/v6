import { primitivesCopy } from '@/config/copy/primitives';
import { cn } from '@/lib/utils';

type StatusVariant =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'more_info_needed'
  | 'expiry_soon'
  | 'expired'
  | 'paused'
  | 'frozen'
  | 'active'
  | 'complete'
  | 'locked'
  | 'verified'
  | 'attention';

// Backward-compat alias
type StatusBadgeStatus = StatusVariant;

type StatusBadgeSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<StatusVariant, string> = {
  pending:          'bg-muted text-muted-foreground border-border',
  under_review:     'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  approved:         'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  complete:         'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  verified:         'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  active:           'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  rejected:         'bg-destructive/10 text-destructive border-destructive/30',
  more_info_needed: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  expiry_soon:      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  expired:          'bg-destructive/10 text-destructive border-destructive/30',
  paused:           'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  attention:        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  frozen:           'bg-destructive/10 text-destructive border-destructive/30',
  locked:           'bg-muted text-muted-foreground border-border',
};

const DEFAULT_LABELS: Record<StatusVariant, string> = {
  pending:          primitivesCopy.statusBadge.pending,
  under_review:     primitivesCopy.statusBadge.under_review,
  approved:         primitivesCopy.statusBadge.approved,
  rejected:         primitivesCopy.statusBadge.rejected,
  more_info_needed: primitivesCopy.statusBadge.more_info_needed,
  expiry_soon:      primitivesCopy.statusBadge.expiry_soon,
  expired:          primitivesCopy.statusBadge.expired,
  paused:           primitivesCopy.statusBadge.paused,
  frozen:           primitivesCopy.statusBadge.frozen,
  active:           primitivesCopy.statusBadge.active,
  complete:         primitivesCopy.statusBadge.complete,
  locked:           primitivesCopy.statusBadge.locked,
  verified:         primitivesCopy.statusBadge.verified,
  attention:        primitivesCopy.statusBadge.attention,
};

const SIZE_CLASSES: Record<StatusBadgeSize, string> = {
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
};

const DOT_SIZE_CLASSES: Record<StatusBadgeSize, string> = {
  sm: 'h-1 w-1',
  md: 'h-1.5 w-1.5',
  lg: 'h-2 w-2',
};

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  size?: StatusBadgeSize;
  className?: string;
}

export function StatusBadge({ status, label, size = 'md', className }: StatusBadgeProps) {
  const displayLabel = label ?? DEFAULT_LABELS[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium',
        SIZE_CLASSES[size],
        variantClasses[status],
        status === 'expired' && 'line-through',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('rounded-full bg-current shrink-0', DOT_SIZE_CLASSES[size])}
      />
      {displayLabel}
    </span>
  );
}

export type { StatusVariant, StatusBadgeStatus, StatusBadgeSize, StatusBadgeProps };
