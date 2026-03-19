'use client';

import Link from 'next/link';
import { WarningCircle } from '@/components/icons';

import {
  EmptyState,
  Grid,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/ui/metric-card';
import type { sponsorCopy } from '@/config/copy/sponsor';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { formatNGN } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { routes } from '@/config/routes';

// ── Types ─────────────────────────────────────────────────────────────────────

type Copy = (typeof sponsorCopy)['impact'];

// ── Main component ────────────────────────────────────────────────────────────

export function ImpactPageClient({ copy }: { copy: Copy }) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);
  const { data: impact, isPending, isError } = trpc.sponsor.getSponsorImpact.useQuery();

  if (isPending) {
    return (
      <PageShell width="default">
        <Section>
          <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />
          <Grid cols={{ sm: 2, lg: 3 }} gap="md">
            {Array.from({ length: 5 }).map((_, i) => (
              <MetricCard key={i} label="" value="" loading />
            ))}
          </Grid>
        </Section>
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell width="default">
        <Section>
          <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-12 text-center">
            <WarningCircle
              className="size-8 text-destructive/60"
              weight="duotone"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-foreground">
              {copy.empty.title}
            </p>
          </div>
        </Section>
      </PageShell>
    );
  }

  if (!impact) {
    return (
      <PageShell width="default">
        <Section>
          <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />
          <EmptyState
            title={copy.empty.title}
            description={copy.empty.description}
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href={routes.dashboard.sponsor.students}>{copy.empty.action}</Link>
              </Button>
            }
          />
        </Section>
      </PageShell>
    );
  }

  const hasData =
    impact.totalDisbursedKobo > 0 ||
    impact.studentsHelped > 0 ||
    impact.certificatesIssued > 0 ||
    impact.activeCommitmentsCount > 0 ||
    impact.completedCommitmentsCount > 0;

  if (!hasData) {
    return (
      <PageShell width="default">
        <Section>
          <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />
          <EmptyState
            title={copy.empty.title}
            description={copy.empty.description}
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href={routes.dashboard.sponsor.students}>{copy.empty.action}</Link>
              </Button>
            }
          />
        </Section>
      </PageShell>
    );
  }

  const stats = [
    { label: copy.stats.totalDisbursed, value: formatNGN(impact.totalDisbursedKobo) },
    { label: copy.stats.studentsHelped, value: String(impact.studentsHelped) },
    { label: copy.stats.certificatesIssued, value: String(impact.certificatesIssued) },
    { label: copy.stats.activeCommitments, value: String(impact.activeCommitmentsCount) },
    { label: copy.stats.completedCommitments, value: String(impact.completedCommitmentsCount) },
  ];

  return (
    <PageShell width="default">
      <Section>
        <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />
        <Grid cols={{ sm: 2, lg: 3 }} gap="md">
          {stats.map((s) => (
            <MetricCard key={s.label} label={s.label} value={s.value} />
          ))}
        </Grid>
      </Section>
    </PageShell>
  );
}
