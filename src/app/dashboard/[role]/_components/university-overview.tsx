import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  PageHeader,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { universityCopy } from '@/config/copy/university';
import { api } from '@/trpc/server';

import { OverviewPageClient } from '../overview/overview-page-client';

type UniversityOverviewProps = {
  caller: Awaited<ReturnType<typeof api>>;
};

export async function UniversityOverview({ caller }: UniversityOverviewProps) {
  const copy = universityCopy.overview;
  const data = await caller.university.getOverview();

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader
          title={copy.welcomeTitle}
          description={copy.subtitle}
        />
        <OverviewPageClient data={data} />

        <Button asChild className="min-h-11 w-full sm:w-auto mt-6">
          <Link href="/dashboard/university/pipeline">
            {universityCopy.nav.pipeline}
          </Link>
        </Button>
      </Section>
    </PageShell>
  );
}
