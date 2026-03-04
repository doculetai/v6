import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"

import { primitivesCopy } from "@/config/copy/primitives"
import { cn } from "@/lib/utils"

import { TimestampLabel } from "./timestamp-label"

type MetricDeltaDirection = "up" | "down" | "neutral"

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: React.ReactNode
  deltaValue?: string
  deltaLabel?: string
  deltaDirection?: MetricDeltaDirection
  timestamp?: string | Date
  loading?: boolean
  error?: boolean
  errorLabel?: string
}

function MetricCard({
  label,
  value,
  deltaValue,
  deltaLabel,
  deltaDirection = "neutral",
  timestamp,
  loading = false,
  error = false,
  errorLabel = primitivesCopy.labels.metricLoadError,
  className,
  ...props
}: MetricCardProps) {
  if (loading) {
    return (
      <div
        className={cn("rounded-xl border bg-card p-5", className)}
        data-testid="metric-card-loading"
        aria-busy="true"
        {...props}
      >
        <div className="h-4 w-24 animate-pulse rounded bg-muted/60" />
        <div className="mt-3 h-8 w-32 animate-pulse rounded bg-muted/60" />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn("rounded-xl border border-destructive/30 bg-card p-5", className)}
        {...props}
      >
        <p className="text-sm font-medium text-destructive">{errorLabel}</p>
      </div>
    )
  }

  const showDelta = Boolean(deltaValue)
  const deltaToneClass =
    deltaDirection === "up"
      ? "text-success"
      : deltaDirection === "down"
        ? "text-destructive"
        : "text-muted-foreground"

  return (
    <div className={cn("rounded-xl border bg-card p-5", className)} {...props}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</div>

      {showDelta ? (
        <div className={cn("mt-3 inline-flex items-center gap-1 text-sm", deltaToneClass)}>
          {deltaDirection === "up" ? (
            <TrendingUp className="size-4" aria-hidden="true" />
          ) : null}
          {deltaDirection === "down" ? (
            <TrendingDown className="size-4" aria-hidden="true" />
          ) : null}
          <span>{deltaValue}</span>
          {deltaLabel ? <span className="text-muted-foreground">{deltaLabel}</span> : null}
        </div>
      ) : null}

      {timestamp ? (
        <div className="mt-3">
          <TimestampLabel value={timestamp} mode="both" />
        </div>
      ) : null}
    </div>
  )
}

export { MetricCard }
export type { MetricCardProps, MetricDeltaDirection }
