"use client"

import * as React from "react"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Label,
} from "recharts"

import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface PieChartProps {
  data: Array<{ name: string; value: number }>
  config: ChartConfig
  donut?: boolean
  showLegend?: boolean
  centerLabel?: string
  centerValue?: string
  className?: string
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

function PieChart({
  data,
  config,
  donut = false,
  showLegend = true,
  centerLabel,
  centerValue,
  className,
}: PieChartProps) {
  return (
    <ChartContainer config={config} className={className}>
      <RechartsPieChart>
        <Tooltip content={<ChartTooltipContent hideLabel />} />
        {showLegend && <Legend content={<ChartLegendContent />} />}
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={donut ? "60%" : 0}
          outerRadius="80%"
          strokeWidth={2}
          stroke="hsl(var(--background))"
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={
                config[entry.name]?.color ??
                CHART_COLORS[index % CHART_COLORS.length]
              }
            />
          ))}
          {donut && (centerLabel || centerValue) && (
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {centerValue && (
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold font-mono"
                        >
                          {centerValue}
                        </tspan>
                      )}
                      {centerLabel && (
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          {centerLabel}
                        </tspan>
                      )}
                    </text>
                  )
                }
                return null
              }}
            />
          )}
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  )
}

export { PieChart }
export type { PieChartProps }
