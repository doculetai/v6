import { FormSkeleton } from '@/components/skeletons/PageSkeletons';
import { PageShell, Section, Stack } from '@/components/layout/content-primitives';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActionsLoading() {
  return (
    <PageShell width="narrow">
      <Section>
        <Stack gap="lg">
          <div className="space-y-2 border-b border-border pb-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <FormSkeleton fields={3} />
        </Stack>
      </Section>
    </PageShell>
  );
}
