import type React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type SkeletonVariant = "card" | "list-row" | "form" | "stats"

interface SkeletonGroupProps {
  variant: SkeletonVariant
  count?: number
  className?: string
}

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-44 w-full rounded-lg" aria-hidden="true" />
      <Skeleton className="h-4 w-3/4" aria-hidden="true" />
      <Skeleton className="h-4 w-1/2" aria-hidden="true" />
    </div>
  )
}

function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-full" aria-hidden="true" />
        <Skeleton className="h-3 w-2/3" aria-hidden="true" />
      </div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" aria-hidden="true" />
          <Skeleton className="h-10 w-full rounded-md" aria-hidden="true" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-md" aria-hidden="true" />
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-lg" aria-hidden="true" />
      ))}
    </div>
  )
}

const variantComponents: Record<SkeletonVariant, React.ComponentType> = {
  card: CardSkeleton,
  "list-row": ListRowSkeleton,
  form: FormSkeleton,
  stats: StatsSkeleton,
}

function SkeletonGroup({ variant, count = 1, className }: SkeletonGroupProps) {
  const VariantComponent = variantComponents[variant]
  return (
    <div role="status" aria-label="Loading content" className={cn("flex flex-col gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <VariantComponent key={i} />
      ))}
    </div>
  )
}

export { SkeletonGroup }
export type { SkeletonGroupProps, SkeletonVariant }
