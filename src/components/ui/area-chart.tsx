"use client"

import * as React from "react"
import {
  AreaChart as RechartsAreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"

import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface AreaChartProps {
  data: Record<string, unknown>[]
  config: ChartConfig
  xKey: string
  yKeys: string[]
  stacked?: boolean
  showGrid?: boolean
  showLegend?: boolean
  className?: string
}

function AreaChart({
  data,
  config,
  xKey,
  yKeys,
  stacked = false,
  showGrid = true,
  showLegend = false,
  className,
}: AreaChartProps) {
  return (
    <ChartContainer config={config} className={className}>
      <RechartsAreaChart data={data}>
        <defs>
          {yKeys.map((key) => (
            <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={`var(--color-${key})`}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={`var(--color-${key})`}
                stopOpacity={0.05}
              />
            </linearGradient>
          ))}
        </defs>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
        )}
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
        />
        <Tooltip content={<ChartTooltipContent />} />
        {showLegend && <Legend content={<ChartLegendContent />} />}
        {yKeys.map((key) => (
          <Area
            key={key}
            dataKey={key}
            type="monotone"
            fill={`url(#fill-${key})`}
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            stackId={stacked ? "stack" : undefined}
          />
        ))}
      </RechartsAreaChart>
    </ChartContainer>
  )
}

export { AreaChart }
export type { AreaChartProps }
