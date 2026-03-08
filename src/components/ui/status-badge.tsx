import { primitivesCopy } from "@/config/copy/primitives"
import { cn } from "@/lib/utils"

type StatusBadgeStatus =
  | "pending"
  | "verified"
  | "approved"
  | "rejected"
  | "attention"
  | "under_review"
  | "more_info_needed"
  | "expiry_soon"
  | "expired"
  | "paused"
  | "frozen"
  | "active"
  | "complete"
  | "locked"

type StatusBadgeSize = "sm" | "md" | "lg"

interface StatusBadgeProps {
  status: StatusBadgeStatus
  label?: string
  size?: StatusBadgeSize
  className?: string
}

const DEFAULT_LABELS: Record<StatusBadgeStatus, string> = {
  pending:          primitivesCopy.statusBadge.pending,
  verified:         primitivesCopy.statusBadge.verified,
  approved:         primitivesCopy.statusBadge.approved,
  rejected:         primitivesCopy.statusBadge.rejected,
  attention:        primitivesCopy.statusBadge.attention,
  under_review:     primitivesCopy.statusBadge.under_review,
  more_info_needed: primitivesCopy.statusBadge.more_info_needed,
  expiry_soon:      primitivesCopy.statusBadge.expiry_soon,
  expired:          primitivesCopy.statusBadge.expired,
  paused:           primitivesCopy.statusBadge.paused,
  frozen:           primitivesCopy.statusBadge.frozen,
  active:           primitivesCopy.statusBadge.active,
  complete:         primitivesCopy.statusBadge.complete,
  locked:           primitivesCopy.statusBadge.locked,
}

const STATUS_STYLES: Record<StatusBadgeStatus, { badge: string; dot: string }> = {
  pending: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  verified: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  approved: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  complete: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  active: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    dot: "bg-blue-600",
  },
  rejected: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  attention: {
    badge: "bg-warning/10 text-warning",
    dot: "bg-warning",
  },
  under_review: {
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  more_info_needed: {
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  expiry_soon: {
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  expired: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  paused: {
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  frozen: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  locked: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
}

const SIZE_STYLES: Record<StatusBadgeSize, { badge: string; dot: string }> = {
  sm: {
    badge: "text-xs",
    dot: "w-1.5 h-1.5",
  },
  md: {
    badge: "text-sm",
    dot: "w-2 h-2",
  },
  lg: {
    badge: "text-base",
    dot: "w-2.5 h-2.5",
  },
}

function StatusBadge({ status, label, size = "md", className }: StatusBadgeProps) {
  const displayLabel = label ?? DEFAULT_LABELS[status]
  const statusStyle = STATUS_STYLES[status]
  const sizeStyle = SIZE_STYLES[size]

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5 font-medium",
        statusStyle.badge,
        sizeStyle.badge,
        status === "expired" && "line-through",
        className,
      )}
    >
      <span
        data-slot="dot"
        className={cn("rounded-full shrink-0", statusStyle.dot, sizeStyle.dot)}
        aria-hidden="true"
      />
      {displayLabel}
    </span>
  )
}

export { StatusBadge }
export type { StatusBadgeStatus, StatusBadgeSize, StatusBadgeProps }
