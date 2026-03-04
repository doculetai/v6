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
      <Skeleton className="h-[180px] w-full rounded-lg" aria-hidden="true" style={{ animationDelay: `${groupDelay}ms` }} />
      <Skeleton className="h-4 w-3/4" aria-hidden="true" style={{ animationDelay: `${groupDelay + 75}ms` }} />
      <Skeleton className="h-4 w-1/2" aria-hidden="true" style={{ animationDelay: `${groupDelay + 150}ms` }} />
    </div>
  )
}

function ListRowSkeleton({ groupDelay }: { groupDelay: number }) {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" aria-hidden="true" style={{ animationDelay: `${groupDelay}ms` }} />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-full" aria-hidden="true" style={{ animationDelay: `${groupDelay + 75}ms` }} />
        <Skeleton className="h-3 w-2/3" aria-hidden="true" style={{ animationDelay: `${groupDelay + 150}ms` }} />
      </div>
    </div>
  )
}

function FormSkeleton({ groupDelay }: { groupDelay: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" aria-hidden="true" style={{ animationDelay: `${groupDelay + i * 2 * 75}ms` }} />
          <Skeleton className="h-10 w-full rounded-md" aria-hidden="true" style={{ animationDelay: `${groupDelay + (i * 2 + 1) * 75}ms` }} />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-md" aria-hidden="true" style={{ animationDelay: `${groupDelay + 6 * 75}ms` }} />
    </div>
  )
}

function StatsSkeleton({ groupDelay }: { groupDelay: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-lg" aria-hidden="true" style={{ animationDelay: `${groupDelay + i * 75}ms` }} />
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
