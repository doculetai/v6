export default function AnalyticsLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Page header skeleton */}
      <div className="border-b border-border pb-4">
        <div className="h-7 w-32 animate-pulse rounded bg-muted/60" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted/60" />
      </div>

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-muted/60" />
            <div className="mt-3 h-8 w-32 animate-pulse rounded bg-muted/60" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="rounded-xl border bg-card p-5">
        <div className="h-5 w-48 animate-pulse rounded bg-muted/60" />
        <div className="mt-6 h-48 animate-pulse rounded bg-muted/40" />
      </div>

      {/* Tables skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card">
            <div className="border-b border-border px-5 py-3">
              <div className="h-4 w-32 animate-pulse rounded bg-muted/60" />
            </div>
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 animate-pulse rounded bg-muted/60" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
