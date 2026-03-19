"use client"

import * as React from "react"
import {
  LineChart as RechartsLineChart,
  Line,
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

interface LineChartProps {
  data: Record<string, unknown>[]
  config: ChartConfig
  xKey: string
  yKeys: string[]
  showGrid?: boolean
  showLegend?: boolean
  showDots?: boolean
  className?: string
}

function LineChart({
  data,
  config,
  xKey,
  yKeys,
  showGrid = true,
  showLegend = false,
  showDots = false,
  className,
}: LineChartProps) {
  return (
    <ChartContainer config={config} className={className}>
      <RechartsLineChart data={data}>
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
          <Line
            key={key}
            dataKey={key}
            type="monotone"
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            dot={showDots}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  )
}

export { LineChart }
export type { LineChartProps }
