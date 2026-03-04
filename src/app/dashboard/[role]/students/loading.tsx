import { TableSkeleton } from '@/components/skeletons/PageSkeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 border-b border-border pb-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>
      <TableSkeleton rows={8} columns={4} />
    </div>
  );
}
