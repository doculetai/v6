import { cn } from "@/lib/utils"

type StatusBadgeStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "attention"
  | "expired"

type StatusBadgeSize = "sm" | "md" | "lg"

interface StatusBadgeProps {
  status: StatusBadgeStatus
  label?: string
  size?: StatusBadgeSize
  className?: string
}

const DEFAULT_LABELS: Record<StatusBadgeStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
  attention: "Attention needed",
  expired: "Expired",
}

const STATUS_STYLES: Record<StatusBadgeStatus, { badge: string; dot: string }> = {
  pending: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  verified: {
    badge: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  rejected: {
    badge: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  attention: {
    badge: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  expired: {
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
