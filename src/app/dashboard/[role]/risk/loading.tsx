import { StatsRowSkeleton, TableSkeleton } from '@/components/skeletons/PageSkeletons';
import { PageShell, Section, Stack } from '@/components/layout/content-primitives';
import { Skeleton } from '@/components/ui/skeleton';

export default function RiskLoading() {
  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="lg">
          <div className="space-y-2 border-b border-border pb-4">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-72" />
          </div>
          <StatsRowSkeleton />
          <TableSkeleton rows={6} columns={5} />
        </Stack>
      </Section>
    </PageShell>
  );
}
