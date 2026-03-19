"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────

type ChartConfig = Record<
  string,
  {
    label: string
    color: string
    icon?: React.ComponentType
  }
>

// ── Context ────────────────────────────────────────────────────────────

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChartConfig() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error("useChartConfig must be used within ChartContainer")
  return ctx
}

// ── ChartContainer ─────────────────────────────────────────────────────

function ChartContainer({
  config,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
}) {
  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {}
    for (const [key, value] of Object.entries(config)) {
      vars[`--color-${key}`] = value.color
    }
    return vars
  }, [config])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart-container"
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/50 [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        style={cssVars as React.CSSProperties}
        {...props}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

// ── ChartTooltip ───────────────────────────────────────────────────────

function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  hideIndicator = false,
  className,
}: {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number
    color?: string
    dataKey?: string
    payload?: Record<string, unknown>
  }>
  label?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  className?: string
}) {
  const { config } = useChartConfig()

  if (!active || !payload?.length) return null

  return (
    <div
      data-slot="chart-tooltip"
      className={cn(
        "min-w-[8rem] rounded-lg border bg-card p-2 text-card-foreground shadow-lg",
        className
      )}
    >
      {!hideLabel && label && (
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          {label}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index)
          const conf = config[key]

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-1.5">
                {!hideIndicator && (
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        item.color ?? conf?.color ?? "var(--color-chart-1)",
                    }}
                  />
                )}
                <span className="text-xs text-muted-foreground">
                  {conf?.label ?? key}
                </span>
              </div>
              <span className="text-xs font-medium font-mono tabular-nums">
                {item.value?.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── ChartLegend ────────────────────────────────────────────────────────

function ChartLegendContent({
  payload,
  className,
}: {
  payload?: Array<{
    value?: string
    color?: string
    dataKey?: string
  }>
  className?: string
}) {
  const { config } = useChartConfig()

  if (!payload?.length) return null

  return (
    <div
      data-slot="chart-legend"
      className={cn(
        "flex flex-wrap items-center justify-center gap-4 pt-3",
        className
      )}
    >
      {payload.map((entry, index) => {
        const key = String(entry.dataKey ?? entry.value ?? index)
        const conf = config[key]

        return (
          <div key={index} className="flex items-center gap-1.5">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  entry.color ?? conf?.color ?? "var(--color-chart-1)",
              }}
            />
            <span className="text-xs text-muted-foreground">
              {conf?.label ?? key}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  useChartConfig,
}
export type { ChartConfig }
