import { StatsRowSkeleton } from '@/components/skeletons/PageSkeletons';
import { PageShell, Section, Stack } from '@/components/layout/content-primitives';
import { Skeleton } from '@/components/ui/skeleton';

export default function ImpactLoading() {
  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="lg">
          <div className="space-y-2 border-b border-border pb-4">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-72" />
          </div>
          <StatsRowSkeleton />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
            <div className="space-y-3 rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </Stack>
      </Section>
    </PageShell>
  );
}
