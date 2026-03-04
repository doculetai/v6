import { Skeleton, TableSkeleton } from '@/components/skeletons/PageSkeletons';

export default function ApiKeysLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-72 sm:w-96" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
      <TableSkeleton rows={4} columns={6} />
    </div>
  );
}
