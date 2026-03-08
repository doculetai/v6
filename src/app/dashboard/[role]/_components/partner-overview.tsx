import { Globe, GraduationCap, Money, Pulse } from '@phosphor-icons/react/dist/ssr';

import {
  Grid,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { partnerCopy } from '@/config/copy/partner';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';

type PartnerOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

export async function PartnerOverview({ email: _email, caller }: PartnerOverviewProps) {
  const copy = partnerCopy.dashboard.overview;
  const [overviewResult, usageResult] = await Promise.allSettled([
    caller.partner.getPartnerOverview(),
    caller.partner.getApiUsage(),
  ]);
  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const usage = usageResult.status === 'fulfilled' ? usageResult.value : null;
  const endpoints = usage?.byEndpoint ?? [];

  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="md">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
              {copy.eyebrow}
            </p>
            <PageHeader title={copy.title} />
          </div>

          <Grid cols={{ sm: 2, lg: 4 }} gap="md">
            <StatCard
              icon={<Pulse className="size-4.5" weight="duotone" aria-hidden="true" />}
              label={copy.stats.apiCallsToday.label}
              value={overview ? String(overview.apiCallsToday) : '—'}
              sub={copy.stats.apiCallsToday.sub}
              accent={overview ? overview.apiCallsToday > 0 : false}
            />
            <StatCard
              icon={<GraduationCap className="size-4.5" weight="duotone" aria-hidden="true" />}
              label={copy.stats.studentsVerified.label}
              value={overview ? String(overview.verifiedStudents) : '—'}
              sub={copy.stats.studentsVerified.sub}
              accent={Boolean(overview?.verifiedStudents)}
            />
            <StatCard
              icon={<Money className="size-4.5" weight="duotone" aria-hidden="true" />}
              label={copy.stats.revenue.label}
              value="—"
              sub={copy.stats.revenue.sub}
            />
            <StatCard
              icon={<Globe className="size-4.5" weight="duotone" aria-hidden="true" />}
              label={copy.stats.webhooks.label}
              value={overview ? String(overview.activeApiKeys) : '—'}
              sub={copy.stats.webhooks.sub}
              accent={Boolean(overview?.activeApiKeys)}
            />
          </Grid>

          <div className="rounded-xl border border-border bg-card px-5 py-5 shadow-xs">
            <p className="pb-3 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
              {copy.endpointHealth.heading}
            </p>
            {endpoints.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground">
                        {copy.endpointHealth.colEndpoint}
                      </th>
                      <th className="pb-2 text-right text-xs font-medium text-muted-foreground">
                        {copy.endpointHealth.colCalls}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoints.slice(0, 6).map((row) => (
                      <tr
                        key={row.endpoint}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-2.5 pr-4">
                          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-success" />
                          <span className="font-mono text-xs text-foreground">
                            {row.endpoint}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono text-xs text-muted-foreground">
                          {row.requestCount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {copy.endpointHealth.empty}
              </p>
            )}
          </div>
        </Stack>
      </Section>
    </PageShell>
  );
}
