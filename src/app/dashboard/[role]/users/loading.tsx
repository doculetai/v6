import { TableSkeleton } from '@/components/skeletons/PageSkeletons';
import { PageShell, Section, Stack } from '@/components/layout/content-primitives';
import { Skeleton } from '@/components/ui/skeleton';

export default function UsersLoading() {
  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="lg">
          <div className="space-y-2 border-b border-border pb-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <Skeleton className="h-9 w-full max-w-sm" />
          </div>
          <TableSkeleton rows={10} columns={6} />
        </Stack>
      </Section>
    </PageShell>
  );
}
