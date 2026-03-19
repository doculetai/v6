import { FormSkeleton } from '@/components/skeletons/PageSkeletons';
import { PageShell, Section, Stack } from '@/components/layout/content-primitives';
import { Skeleton } from '@/components/ui/skeleton';

export default function ComplianceLoading() {
  return (
    <PageShell width="default">
      <Section>
        <Stack gap="lg">
          <div className="space-y-2 border-b border-border pb-4">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-72" />
          </div>
          <FormSkeleton fields={5} />
          <FormSkeleton fields={3} />
        </Stack>
      </Section>
    </PageShell>
  );
}
