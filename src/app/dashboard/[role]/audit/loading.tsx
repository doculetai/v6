import { TableSkeleton } from '@/components/skeletons/PageSkeletons';
import { PageShell, Section, Stack } from '@/components/layout/content-primitives';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuditLoading() {
  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="lg">
          <div className="space-y-2 border-b border-border pb-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-lg" />
            ))}
          </div>
          <TableSkeleton rows={10} columns={6} />
        </Stack>
      </Section>
    </PageShell>
  );
}
