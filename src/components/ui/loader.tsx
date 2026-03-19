"use client"

import * as React from "react"
import { SpinnerGap } from '@/components/icons'
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { primitivesCopy } from '@/config/copy/primitives'

const loaderVariants = cva("animate-spin text-muted-foreground", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
      xl: "size-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

function Loader({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof loaderVariants>) {
  return (
    <div
      data-slot="loader"
      role="status"
      aria-label={primitivesCopy.ariaExtended.loading}
      className={cn("inline-flex", className)}
      {...props}
    >
      <SpinnerGap
        weight="duotone"
        className={cn(loaderVariants({ size }))}
      />
    </div>
  )
}

export { Loader, loaderVariants }
