import { PageShell, Section } from '@/components/layout/content-primitives';
import { Skeleton } from '@/components/ui/skeleton';

export default function SetupLoading() {
  return (
    <PageShell width="narrow">
      <Section>
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-80 mb-6" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </Section>
    </PageShell>
  );
}
