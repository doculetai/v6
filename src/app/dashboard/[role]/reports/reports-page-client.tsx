'use client';

import {
  Users,
  ShieldCheck,
  Clock,
  XCircle,
  GraduationCap,
  ChartBar,
} from '@/components/icons';

import { EmptyState } from '@/components/ui/empty-state';
import { PageShell, Section, Grid, Stack } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { routes } from '@/config/routes';

type ReportsCopy = {
  title: string;
  subtitle: string;
  metrics: {
    totalStudents: string;
    verifiedStudents: string;
    pendingVerifications: string;
    rejectedDocuments: string;
    totalPrograms: string;
    approvalRate: string;
  };
  sections: {
    overview: string;
    breakdown: string;
  };
  empty: { title: string; description: string; action?: string };
};

type Props = {
  copy: ReportsCopy;
};

type MetricCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
};

function MetricCard({ label, value, icon, accent }: MetricCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-4">
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-lg',
          accent ?? 'bg-muted',
        )}
      >
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ReportsPageClient({ copy }: Props) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);
  const { data: reports, isLoading } =
    trpc.universityManagement.getUniversityReports.useQuery();

  if (isLoading) {
    return (
      <PageShell width="wide">
        <Section>
          <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />
          <div className="flex items-center justify-center py-12">
            <Clock
              className="size-6 animate-pulse text-muted-foreground"
              weight="duotone"
              aria-hidden="true"
            />
          </div>
        </Section>
      </PageShell>
    );
  }

  if (!reports || reports.totalStudents === 0) {
    return (
      <PageShell width="wide">
        <Section>
          <Stack gap="md">
            <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />
            <EmptyState heading={copy.empty.title} body={copy.empty.description} action={copy.empty.action ? { label: copy.empty.action, href: routes.dashboard.university.pipeline } : undefined} />
          </Stack>
        </Section>
      </PageShell>
    );
  }

  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="lg">
          <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />

          <div className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {copy.sections.overview}
            </h2>
            <Grid cols={3}>
              <MetricCard
                label={copy.metrics.totalStudents}
                value={reports.totalStudents}
                icon={
                  <Users
                    className="size-5 text-foreground"
                    weight="duotone"
                    aria-hidden="true"
                  />
                }
                accent="bg-primary/10"
              />
              <MetricCard
                label={copy.metrics.verifiedStudents}
                value={reports.verifiedStudents}
                icon={
                  <ShieldCheck
                    className="size-5 text-primary"
                    weight="duotone"
                    aria-hidden="true"
                  />
                }
                accent="bg-primary/10"
              />
              <MetricCard
                label={copy.metrics.approvalRate}
                value={`${reports.approvalRate}%`}
                icon={
                  <ChartBar
                    className="size-5 text-foreground"
                    weight="duotone"
                    aria-hidden="true"
                  />
                }
                accent="bg-muted"
              />
            </Grid>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {copy.sections.breakdown}
            </h2>
            <Grid cols={3}>
              <MetricCard
                label={copy.metrics.pendingVerifications}
                value={reports.pendingVerifications}
                icon={
                  <Clock
                    className="size-5 text-warning"
                    weight="duotone"
                    aria-hidden="true"
                  />
                }
                accent="bg-warning/10"
              />
              <MetricCard
                label={copy.metrics.rejectedDocuments}
                value={reports.rejectedDocuments}
                icon={
                  <XCircle
                    className="size-5 text-destructive"
                    weight="duotone"
                    aria-hidden="true"
                  />
                }
                accent="bg-destructive/10"
              />
              <MetricCard
                label={copy.metrics.totalPrograms}
                value={reports.totalPrograms}
                icon={
                  <GraduationCap
                    className="size-5 text-foreground"
                    weight="duotone"
                    aria-hidden="true"
                  />
                }
                accent="bg-muted"
              />
            </Grid>
          </div>
        </Stack>
      </Section>
    </PageShell>
  );
}
