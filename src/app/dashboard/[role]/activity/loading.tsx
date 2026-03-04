import { Skeleton, TimelineSkeleton } from '@/components/skeletons/PageSkeletons';

export default function ActivityLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <TimelineSkeleton items={8} />
      </div>
    </div>
  );
}
