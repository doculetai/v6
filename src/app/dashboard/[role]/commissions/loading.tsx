import { StatCardSkeleton, TableSkeleton } from '@/components/skeletons/PageSkeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommissionsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-2 border-b border-border pb-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* 3 stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Table */}
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
