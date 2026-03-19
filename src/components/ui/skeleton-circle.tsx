import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const skeletonCircleVariants = cva("rounded-full aspect-square", {
  variants: {
    size: {
      sm: "size-6",
      md: "size-8",
      lg: "size-10",
      xl: "size-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

function SkeletonCircle({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof skeletonCircleVariants>) {
  return (
    <Skeleton
      data-slot="skeleton-circle"
      className={cn(skeletonCircleVariants({ size }), className)}
      {...props}
    />
  )
}

export { SkeletonCircle, skeletonCircleVariants }
