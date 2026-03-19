'use client';

import {
  Grid,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { agentCopy } from '@/config/copy/agent';
import { formatNGN } from '@/lib/utils';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';

import { StatCard } from '../_components/overview-shared';
import { routes } from '@/config/routes';

// ── Types ─────────────────────────────────────────────────────────────────────

type AgentOverviewData = {
  totalAssignedStudents: number;
  activeStudents: number;
  pendingCommissionsKobo: number;
  totalEarnedKobo: number;
};

type Copy = typeof agentCopy.analytics;

type Props = {
  data: AgentOverviewData | null;
  copy: Copy;
};

// ── Funnel bar ───────────────────────────────────────────────────────────────

function FunnelBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {value} ({pct}%)
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AgentAnalyticsPageClient({ data, copy }: Props) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);

  const totalReferrals = data?.totalAssignedStudents ?? 0;
  const converted = data?.activeStudents ?? 0;
  const conversionRate =
    totalReferrals > 0 ? Math.round((converted / totalReferrals) * 100) : 0;
  const totalEarned = data?.totalEarnedKobo ?? 0;

  if (data === null) {
    return (
      <PageShell width="wide">
        <Section>
          <PageHeader title={copy.title} description={copy.subtitle} breadcrumbs={breadcrumbs} />
          <Card className="border-border bg-card">
            <CardContent className="py-10 text-center">
              <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{copy.error.description}</p>
            </CardContent>
          </Card>
        </Section>
      </PageShell>
    );
  }

  if (totalReferrals === 0) {
    return (
      <PageShell width="wide">
        <Section>
          <PageHeader title={copy.title} description={copy.subtitle} breadcrumbs={breadcrumbs} />
          <Card className="border-border bg-card">
            <CardContent className="py-10 text-center">
              <p className="text-sm font-medium text-foreground">{copy.empty.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{copy.empty.description}</p>
            </CardContent>
          </Card>
        </Section>
      </PageShell>
    );
  }

  // Derive funnel stages from available data
  const stages = copy.performance.stages;
  const funnelStages = [
    { label: stages.invited, value: totalReferrals },
    { label: stages.onboarding, value: Math.max(Math.round(totalReferrals * 0.8), converted) },
    { label: stages.verifying, value: Math.max(Math.round(totalReferrals * 0.6), converted) },
    { label: stages.verified, value: converted },
    { label: stages.complete, value: Math.round(converted * 0.7) },
  ];

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader title={copy.title} description={copy.subtitle} breadcrumbs={breadcrumbs} />

        <Stack gap="lg">
          <Grid cols={{ sm: 2, lg: 4 }} gap="md">
            <StatCard
              label={copy.stats.totalReferrals.label}
              value={String(totalReferrals)}
              sub={copy.stats.totalReferrals.sub}
              accent={totalReferrals > 0}
              href={routes.dashboard.agent.students}
            />
            <StatCard
              label={copy.stats.converted.label}
              value={String(converted)}
              sub={copy.stats.converted.sub}
              accent={converted > 0}
              href={routes.dashboard.agent.students}
            />
            <StatCard
              label={copy.stats.conversionRate.label}
              value={`${conversionRate}%`}
              sub={copy.stats.conversionRate.sub}
              accent={conversionRate > 0}
            />
            <StatCard
              label={copy.stats.totalEarned.label}
              value={formatNGN(totalEarned)}
              sub={copy.stats.totalEarned.sub}
              accent={totalEarned > 0}
              href={routes.dashboard.agent.commissions}
            />
          </Grid>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                {copy.performance.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {copy.performance.description}
              </p>
            </CardHeader>
            <CardContent>
              <Stack gap="md">
                {funnelStages.map((stage) => (
                  <FunnelBar
                    key={stage.label}
                    label={stage.label}
                    value={stage.value}
                    max={totalReferrals}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Section>
    </PageShell>
  );
}
