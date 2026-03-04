import * as React from "react"
import { gapClasses, alignClasses, justifyClasses, type GapSize } from "@/components/layout/tokens"
import { cn } from "@/lib/utils"

interface StackProps extends React.ComponentPropsWithoutRef<"div"> {
  direction?: "vertical" | "horizontal"
  gap?: GapSize
  align?: keyof typeof alignClasses
  justify?: keyof typeof justifyClasses
  wrap?: boolean
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ direction = "vertical", gap = "sm", align, justify, wrap = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        gapClasses[gap],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    />
  ),
)
Stack.displayName = "Stack"

export { Stack, type StackProps }
