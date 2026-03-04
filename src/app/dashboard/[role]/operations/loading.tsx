import { StatsRowSkeleton, TableSkeleton } from '@/components/skeletons/PageSkeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function OperationsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1 border-b border-border pb-4">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats row */}
      <StatsRowSkeleton />

      {/* Filter bar */}
      <div className="rounded-xl border border-border bg-card p-3">
        <Skeleton className="h-9 w-full max-w-sm" />
        <div className="mt-3 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Table */}
      <TableSkeleton rows={8} columns={8} />
    </div>
  );
}
