import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  Info,
  CheckCircle,
  Warning,
  XCircle,
} from '@/components/icons'

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative flex w-full gap-3 rounded-lg border p-4 text-sm [&>svg]:shrink-0 [&>svg]:size-5 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        info: "bg-info/10 text-info border-info/20 dark:bg-info/5 dark:border-info/15",
        success:
          "bg-success/10 text-success border-success/20 dark:bg-success/5 dark:border-success/15",
        warning:
          "bg-warning/10 text-warning border-warning/20 dark:bg-warning/5 dark:border-warning/15",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/5 dark:border-destructive/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const variantIcons = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: Warning,
  destructive: XCircle,
} as const

function Alert({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  const Icon = variantIcons[variant ?? "default"]

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon weight="duotone" />
      <div data-slot="alert-body" className="flex-1 space-y-1">
        {children}
      </div>
    </div>
  )
}

function AlertTitle({
  className,
  ...props
}: React.ComponentProps<"h5">) {
  return (
    <h5
      data-slot="alert-title"
      className={cn("font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm opacity-80 [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
