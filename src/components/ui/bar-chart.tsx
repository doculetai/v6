"use client"

import * as React from "react"
import {
  BarChart as RechartsBarChart,
  Bar,
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

interface BarChartProps {
  data: Record<string, unknown>[]
  config: ChartConfig
  xKey: string
  yKeys: string[]
  stacked?: boolean
  horizontal?: boolean
  showGrid?: boolean
  showLegend?: boolean
  className?: string
}

function BarChart({
  data,
  config,
  xKey,
  yKeys,
  stacked = false,
  horizontal = false,
  showGrid = true,
  showLegend = false,
  className,
}: BarChartProps) {
  return (
    <ChartContainer config={config} className={className}>
      <RechartsBarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" vertical={!horizontal} horizontal={horizontal} />
        )}
        {horizontal ? (
          <>
            <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <YAxis dataKey={xKey} type="category" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
          </>
        )}
        <Tooltip content={<ChartTooltipContent />} />
        {showLegend && <Legend content={<ChartLegendContent />} />}
        {yKeys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? "stack" : undefined}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  )
}

export { BarChart }
export type { BarChartProps }
