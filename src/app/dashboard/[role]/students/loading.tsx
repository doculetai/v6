import { UniversityStudentsMetricsSkeleton } from '@/components/university/UniversityStudentsMetrics';
import { Skeleton, TableSkeleton } from '@/components/skeletons/PageSkeletons';

export default function StudentsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-2 border-b border-border pb-4">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Metrics skeleton */}
      <UniversityStudentsMetricsSkeleton />

      {/* FilterBar skeleton */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-3">
        <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
