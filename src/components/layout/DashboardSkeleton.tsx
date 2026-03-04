import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48 bg-muted dark:bg-muted" />
        <Skeleton className="h-5 w-full max-w-xl bg-muted dark:bg-muted" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40 rounded-xl bg-muted dark:bg-muted" />
        <Skeleton className="h-40 rounded-xl bg-muted dark:bg-muted" />
      </div>

      <Skeleton className="h-64 rounded-xl bg-muted dark:bg-muted" />
    </div>
  );
}
