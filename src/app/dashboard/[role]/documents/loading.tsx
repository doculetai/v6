import { DocumentListSkeleton } from '@/components/skeletons/PageSkeletons';
import { PageShell, Section, Stack } from '@/components/layout/content-primitives';
import { Skeleton } from '@/components/ui/skeleton';

export default function DocumentsLoading() {
  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="lg">
          <div className="space-y-2 border-b border-border pb-4">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-72" />
          </div>
          <DocumentListSkeleton items={6} />
        </Stack>
      </Section>
    </PageShell>
  );
}
