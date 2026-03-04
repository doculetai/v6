import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type SkeletonVariant = "card" | "list-row" | "form" | "stats"

interface SkeletonGroupProps {
  variant: SkeletonVariant
  count?: number
  className?: string
}

function CardSkeleton({ groupDelay }: { groupDelay: number }) {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-44 w-full rounded-lg [animation-delay:var(--delay)]" aria-hidden="true" style={{ '--delay': `${groupDelay}ms` } as React.CSSProperties} />
      <Skeleton className="h-4 w-3/4 [animation-delay:var(--delay)]" aria-hidden="true" style={{ '--delay': `${groupDelay + 75}ms` } as React.CSSProperties} />
      <Skeleton className="h-4 w-1/2 [animation-delay:var(--delay)]" aria-hidden="true" style={{ '--delay': `${groupDelay + 150}ms` } as React.CSSProperties} />
    </div>
  )
}

function ListRowSkeleton({ groupDelay }: { groupDelay: number }) {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full [animation-delay:var(--delay)]" aria-hidden="true" style={{ '--delay': `${groupDelay}ms` } as React.CSSProperties} />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-full [animation-delay:var(--delay)]" aria-hidden="true" style={{ '--delay': `${groupDelay + 75}ms` } as React.CSSProperties} />
        <Skeleton className="h-3 w-2/3 [animation-delay:var(--delay)]" aria-hidden="true" style={{ '--delay': `${groupDelay + 150}ms` } as React.CSSProperties} />
      </div>
    </div>
  )
}

function FormSkeleton({ groupDelay }: { groupDelay: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24 [animation-delay:var(--delay)]" aria-hidden="true" style={{ '--delay': `${groupDelay + i * 2 * 75}ms` } as React.CSSProperties} />
          <Skeleton className="h-10 w-full rounded-md [animation-delay:var(--delay)]" aria-hidden="true" style={{ '--delay': `${groupDelay + (i * 2 + 1) * 75}ms` } as React.CSSProperties} />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-md [animation-delay:var(--delay)]" aria-hidden="true" style={{ '--delay': `${groupDelay + 6 * 75}ms` } as React.CSSProperties} />
    </div>
  )
}

function StatsSkeleton({ groupDelay }: { groupDelay: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-lg [animation-delay:var(--delay)]" aria-hidden="true" style={{ '--delay': `${groupDelay + i * 75}ms` } as React.CSSProperties} />
      ))}
    </div>
  )
}

const variantComponents: Record<SkeletonVariant, React.ComponentType<{ groupDelay: number }>> = {
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
        <VariantComponent key={i} groupDelay={i * 150} />
      ))}
    </div>
  )
}

export { SkeletonGroup }
export type { SkeletonGroupProps, SkeletonVariant }
