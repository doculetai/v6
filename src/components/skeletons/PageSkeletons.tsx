import { cn } from '@/lib/utils';

import { Skeleton } from '../ui/skeleton';

// ─── Stat Card Skeleton ──────────────────────────────────
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3 rounded-xl border border-border bg-card p-5', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// ─── Stats Row (4 cards) ─────────────────────────────────
export function StatsRowSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Table Skeleton ──────────────────────────────────────
export function TableSkeleton({
  rows = 8,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border/60 bg-muted/30 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-4', i === 0 ? 'w-32' : i === columns - 1 ? 'ml-auto w-16' : 'w-24')}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border/40 px-4 py-3.5 last:border-0"
        >
          <Skeleton className="size-8 shrink-0 rounded-full" />
          {Array.from({ length: columns - 1 }).map((_, j) => (
            <Skeleton
              key={j}
              className={cn('h-4', j === 0 ? 'w-32' : j === columns - 2 ? 'ml-auto w-16' : 'w-24')}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Kanban Skeleton ──────────────────────────────────────
export function KanbanSkeleton({ columns = 4 }: { columns?: number }) {
  const cardCounts = [4, 3, 2, 1];
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: columns }).map((_, colIdx) => (
        <div
          key={colIdx}
          className="w-72 shrink-0 space-y-3 rounded-xl border border-border bg-muted/30 p-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          {Array.from({ length: cardCounts[colIdx] ?? 1 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-border bg-card p-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="ml-auto h-5 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Card Grid Skeleton ──────────────────────────────────
export function CardGridSkeleton({
  count = 6,
  columns = 3,
}: {
  count?: number;
  columns?: number;
}) {
  const gridClass =
    {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    }[columns] ?? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={cn('grid gap-4', gridClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Profile / Detail Skeleton ────────────────────────────
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <Skeleton className="size-20 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
      {/* Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Timeline Skeleton ────────────────────────────────────
export function TimelineSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-3 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            {i < items - 1 && <div className="mt-1 w-px flex-1 bg-border/60" />}
          </div>
          <div className="flex-1 space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-full max-w-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Stepper Skeleton ─────────────────────────────────────
export function StepperSkeleton({ steps = 4 }: { steps?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: steps }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="mt-0.5 size-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Form Skeleton ────────────────────────────────────────
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Dashboard Overview Skeleton (full page) ──────────────
export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      {/* Stats row */}
      <StatsRowSkeleton />
      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-5 w-32" />
          <TableSkeleton rows={5} columns={4} />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-28" />
          <TimelineSkeleton items={4} />
        </div>
      </div>
    </div>
  );
}

// ─── Document List Skeleton ───────────────────────────────
export function DocumentListSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton } from '../ui/skeleton';
