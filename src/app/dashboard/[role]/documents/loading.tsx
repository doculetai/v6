import { StatsRowSkeleton, TableSkeleton } from '@/components/skeletons/PageSkeletons';

export default function DocumentsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header placeholder */}
      <div className="space-y-1 border-b border-border pb-4">
        <div className="h-8 w-56 animate-pulse rounded bg-muted/60" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted/60" />
      </div>

      <StatsRowSkeleton />

      {/* FilterBar placeholder */}
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted/60 md:max-w-sm" />
        <div className="mt-3 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-20 animate-pulse rounded-full bg-muted/60" />
          ))}
        </div>
      </div>

      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}
