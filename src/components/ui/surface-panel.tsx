import * as React from "react"

import { cn } from "@/lib/utils"

type SurfaceVariant = "default" | "glass" | "elevated"
type SurfaceDensity = "compact" | "comfortable" | "dense"

interface SurfacePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant
  density?: SurfaceDensity
}

const variantClasses: Record<SurfaceVariant, string> = {
  default: "border bg-card text-card-foreground shadow-sm",
  glass: "border bg-white/70 backdrop-blur-sm text-card-foreground shadow-sm dark:bg-white/5",
  elevated: "border bg-card text-card-foreground shadow-md",
}

const densityClasses: Record<SurfaceDensity, string> = {
  compact: "p-3",
  comfortable: "p-5",
  dense: "p-4",
}

function SurfacePanel({
  className,
  variant = "default",
  density = "comfortable",
  ...props
}: SurfacePanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl",
        variantClasses[variant],
        densityClasses[density],
        className,
      )}
      {...props}
    />
  )
}

export { SurfacePanel }
export type { SurfacePanelProps, SurfaceVariant, SurfaceDensity }
