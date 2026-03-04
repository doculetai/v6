import { cn } from "@/lib/utils"

type TimestampMode = "absolute" | "relative" | "both"

interface TimestampLabelProps {
  value: string | Date | number
  mode?: TimestampMode
  locale?: string
  invalidLabel?: string
  now?: Date
  className?: string
}

function normalizeDate(value: string | Date | number): Date | null {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatRelative(date: Date, now: Date, locale: string): string {
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000)
  const absSeconds = Math.abs(diffSeconds)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "always" })

  if (absSeconds < 60) {
    return rtf.format(diffSeconds, "second")
  }

  const diffMinutes = Math.round(diffSeconds / 60)
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute")
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour")
  }

  const diffDays = Math.round(diffHours / 24)
  return rtf.format(diffDays, "day")
}

function formatAbsolute(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(date)
}

function TimestampLabel({
  value,
  mode = "absolute",
  locale = "en-NG",
  invalidLabel = "Invalid date",
  now = new Date(),
  className,
}: TimestampLabelProps) {
  const date = normalizeDate(value)

  if (!date) {
    return <span className={cn("text-sm text-muted-foreground", className)}>{invalidLabel}</span>
  }

  const absolute = formatAbsolute(date, locale)
  const relative = formatRelative(date, now, locale)

  if (mode === "relative") {
    return <span className={cn("text-sm text-muted-foreground", className)}>{relative}</span>
  }

  if (mode === "both") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-sm text-muted-foreground", className)}>
        <span>{relative}</span>
        <span aria-hidden="true">•</span>
        <span>{absolute}</span>
      </span>
    )
  }

  return <span className={cn("text-sm text-muted-foreground", className)}>{absolute}</span>
}

export { TimestampLabel }
export type { TimestampLabelProps, TimestampMode }
