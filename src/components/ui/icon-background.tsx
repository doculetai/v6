import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const iconBackgroundVariants = cva(
  "inline-flex shrink-0 items-center justify-center [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary dark:bg-primary/15",
        success: "bg-success/10 text-success dark:bg-success/15",
        warning: "bg-warning/10 text-warning dark:bg-warning/15",
        destructive:
          "bg-destructive/10 text-destructive dark:bg-destructive/15",
        neutral: "bg-muted text-muted-foreground",
      },
      size: {
        sm: "size-8 rounded-lg [&>svg]:size-4",
        md: "size-10 rounded-xl [&>svg]:size-5",
        lg: "size-12 rounded-xl [&>svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

function IconBackground({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof iconBackgroundVariants>) {
  return (
    <div
      data-slot="icon-background"
      className={cn(iconBackgroundVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { IconBackground, iconBackgroundVariants }
