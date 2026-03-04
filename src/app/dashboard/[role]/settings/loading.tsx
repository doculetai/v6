import { Skeleton } from '@/components/skeletons/PageSkeletons';
import { FormSkeleton } from '@/components/skeletons/PageSkeletons';

function SectionHeaderSkeleton() {
  return (
    <div className="space-y-1.5 border-b border-border pb-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-72" />
    </div>
  );
}

function SessionPanelSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 space-y-1.5">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-border/50 p-3"
          >
            <Skeleton className="size-10 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-1 border-b border-border pb-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Profile section skeleton */}
      <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        <SectionHeaderSkeleton />
        <FormSkeleton fields={4} />
      </div>

      {/* Notifications section skeleton */}
      <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        <SectionHeaderSkeleton />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="mt-0.5 size-4 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Webhook section skeleton */}
      <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        <SectionHeaderSkeleton />
        <FormSkeleton fields={1} />
      </div>

      {/* Sessions skeleton */}
      <SessionPanelSkeleton />
    </section>
  );
}
