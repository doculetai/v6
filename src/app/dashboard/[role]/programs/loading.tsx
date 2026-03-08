import { TableSkeleton } from '@/components/skeletons/PageSkeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProgramsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between border-b border-border pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <TableSkeleton rows={6} columns={5} />
    </div>
  );
}
