import * as React from "react"
import {
  gapClasses,
  colClasses,
  breakpointColClasses,
  alignClasses,
  type GapSize,
  type GridCols,
} from "@/components/layout/tokens"
import { cn } from "@/lib/utils"

type BreakpointCols = {
  sm?: number
  md?: number
  lg?: number
  xl?: number
}

interface GridProps extends React.ComponentPropsWithoutRef<"div"> {
  cols?: GridCols | BreakpointCols
  gap?: GapSize
  align?: keyof typeof alignClasses
}

function resolveColClasses(cols: GridCols | BreakpointCols): string {
  if (typeof cols === "number") {
    return colClasses[cols as GridCols] ?? "grid-cols-1"
  }
  const classes: string[] = ["grid-cols-1"]
  for (const [bp, count] of Object.entries(cols)) {
    const bpMap = breakpointColClasses[bp as keyof typeof breakpointColClasses]
    if (bpMap && count !== undefined && count in bpMap) {
      classes.push(bpMap[count as keyof typeof bpMap])
    }
  }
  return classes.join(" ")
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ cols = 1, gap = "sm", align, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid",
        resolveColClasses(cols),
        gapClasses[gap],
        align && alignClasses[align],
        className,
      )}
      {...props}
    />
  ),
)
Grid.displayName = "Grid"

export { Grid, type GridProps }
