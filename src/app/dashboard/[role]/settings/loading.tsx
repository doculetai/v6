import { FormSkeleton, Skeleton } from '@/components/skeletons';
import { sponsorCopy } from '@/config/copy/sponsor';

export default function SponsorSettingsLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6" aria-busy="true" aria-live="polite">
      <header className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm dark:border-border/70 dark:bg-card/70 md:p-8">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-10 w-64" />
        <Skeleton className="mt-3 h-4 w-full max-w-3xl" />
      </header>

      <p className="sr-only">{sponsorCopy.settings.states.loadingTitle}</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <FormSkeleton fields={7} />
        <div className="space-y-6">
          <FormSkeleton fields={4} />
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="mt-2 h-4 w-72" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`session-skeleton-${index}`}
                  className="rounded-lg border border-border/70 bg-background/70 p-4"
                >
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-2 h-3 w-48" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
