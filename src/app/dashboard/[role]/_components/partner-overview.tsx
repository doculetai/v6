import { Pulse, Files, GraduationCap, ShieldCheck } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Grid,
  PageHeader,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { JourneyProgress } from '@/components/ui/journey-progress';
import { partnerCopy } from '@/config/copy/partner';
import { getFirstName } from '@/lib/get-first-name';
import { computePartnerJourney } from '@/lib/journey/partner';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';

type PartnerOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

export async function PartnerOverview({ email, caller }: PartnerOverviewProps) {
  const firstName = getFirstName(email);
  const [overviewResult, usageResult] = await Promise.allSettled([
    caller.partner.getPartnerOverview(),
    caller.partner.getApiUsage(),
  ]);
  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const usage = usageResult.status === 'fulfilled' ? usageResult.value : null;
  const copy = partnerCopy.dashboard.overview;
  const journeyState = computePartnerJourney(
    {
      activeApiKeys: overview?.activeApiKeys ?? 0,
      apiCallsToday: overview?.apiCallsToday ?? 0,
      totalStudents: overview?.totalStudents ?? 0,
      verifiedStudents: overview?.verifiedStudents ?? 0,
    },
    partnerCopy.journey,
  );

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader
          title={copy.welcomeTitle(firstName)}
          description={copy.subtitle(overview?.organizationName ?? null)}
        />
        <JourneyProgress
          stages={journeyState.stages}
          nextAction={journeyState.nextAction}
          allComplete={journeyState.allComplete}
          completionMessage={journeyState.completionMessage}
        />

        <Grid cols={{ sm: 2, md: 4 }} gap="md" className="mt-6">
          <StatCard
            icon={<GraduationCap className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.totalStudents.label}
            value={overview ? String(overview.totalStudents) : '—'}
            sub={copy.stats.totalStudents.sub}
            accent={Boolean(overview?.totalStudents)}
          />
          <StatCard
            icon={<ShieldCheck className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.verifiedStudents.label}
            value={overview ? String(overview.verifiedStudents) : '—'}
            sub={copy.stats.verifiedStudents.sub}
            accent={Boolean(overview?.verifiedStudents)}
          />
          <StatCard
            icon={<Files className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.activeApiKeys.label}
            value={overview ? String(overview.activeApiKeys) : '—'}
            sub={copy.stats.activeApiKeys.sub}
            accent={Boolean(overview?.activeApiKeys)}
          />
          <StatCard
            icon={<Pulse className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={partnerCopy.dashboard.stats.apiCallsToday}
            value={
              overview
                ? `${overview.apiCallsToday.toLocaleString()} / ${overview.apiDailyLimit.toLocaleString()}`
                : '—'
            }
            sub={copy.apiResetSub}
            accent={overview ? overview.apiCallsToday > 0 : false}
          />
        </Grid>

        <Card className="border-border bg-card mt-6">
        <CardContent className="pt-5">
          <p className="text-sm text-muted-foreground">
            {overview?.totalStudents
              ? copy.summary.withStudents(overview.verifiedStudents, overview.totalStudents)
              : copy.summary.empty}
          </p>
        </CardContent>
      </Card>

      {usage && usage.byEndpoint.length > 0 && (
        <Card className="border-border bg-card mt-6">
          <CardContent className="pt-5">
            <h3 className="text-sm font-medium text-foreground mb-3">
              {partnerCopy.dashboard.usage.title}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-120 text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                      {partnerCopy.dashboard.usage.table.endpoint}
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                      {partnerCopy.dashboard.usage.table.calls}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usage.byEndpoint.map((row) => (
                    <tr
                      key={row.endpoint}
                      className="bg-card transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-2 font-mono text-foreground">
                        {row.endpoint}
                      </td>
                      <td className="px-4 py-2 text-right text-muted-foreground">
                        {row.requestCount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

        <Button asChild className="min-h-11 w-full sm:w-auto mt-6">
          <Link href="/dashboard/partner/students">{copy.cta}</Link>
        </Button>
      </Section>
    </PageShell>
  );
}
