import { StatsRowSkeleton, TableSkeleton } from "@/components/skeletons/PageSkeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function PipelineLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Stats row skeleton */}
      <StatsRowSkeleton />

      {/* Filter bar skeleton */}
      <div className="rounded-xl border bg-card p-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="mt-3 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-md" />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <TableSkeleton rows={8} columns={8} />
    </div>
  )
}
