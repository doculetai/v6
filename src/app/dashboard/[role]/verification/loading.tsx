import { PageShell, Section } from '@/components/layout/content-primitives';
import { Skeleton } from '@/components/ui/skeleton';

export default function VerificationLoading() {
  return (
    <PageShell width="narrow">
      <Section>
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-80 mb-6" />
        <Skeleton className="h-2 w-full rounded-full mb-8" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl mb-4" />
        ))}
      </Section>
    </PageShell>
  );
}
