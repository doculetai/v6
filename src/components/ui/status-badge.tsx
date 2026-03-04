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
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  rejected: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  attention: {
    badge: "bg-warning/10 text-warning",
    dot: "bg-warning",
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
