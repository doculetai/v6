import { ArrowRight, Key, Warning } from '@/components/icons';
import Link from 'next/link';

import { UsageMeter } from '@/components/ui/usage-meter';

import { Button } from '@/components/ui/button';
import {
  Grid,
  PageHeader,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { FxRateCard } from '@/components/shared/FxRateCard';
import { JourneyProgress } from '@/components/ui/journey-progress';
import { PartnerHighUsageCallout } from '@/components/partner/PartnerHighUsageCallout';
import { partnerCopy } from '@/config/copy/partner';
import { getFirstName } from '@/lib/get-first-name';
import { computePartnerJourney } from '@/lib/journey/partner';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';
import { routes } from '@/config/routes';

type PartnerOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

export async function PartnerOverview({ email, caller }: PartnerOverviewProps) {
  const firstName = getFirstName(email);
  const [overviewResult, usageResult, fxResult] = await Promise.allSettled([
    caller.partner.getPartnerOverview(),
    caller.partner.getApiUsage(),
    caller.admin.getLatestFxRate(),
  ]);
  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const usage = usageResult.status === 'fulfilled' ? usageResult.value : null;
  const fxRate = fxResult.status === 'fulfilled' ? fxResult.value : null;
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
            label={copy.stats.totalStudents.label}
            value={overview ? String(overview.totalStudents) : '—'}
            sub={copy.stats.totalStudents.sub}
            accent={Boolean(overview?.totalStudents)}
            href={routes.dashboard.partner.students}
          />
          <StatCard
            label={copy.stats.verifiedStudents.label}
            value={overview ? String(overview.verifiedStudents) : '—'}
            sub={copy.stats.verifiedStudents.sub}
            accent={Boolean(overview?.verifiedStudents)}
            href={routes.dashboard.partner.students}
          />
          <StatCard
            label={copy.stats.activeApiKeys.label}
            value={overview ? String(overview.activeApiKeys) : '—'}
            sub={copy.stats.activeApiKeys.sub}
            accent={Boolean(overview?.activeApiKeys)}
            href={routes.dashboard.partner.apiKeys}
          />
          <StatCard
            label={partnerCopy.dashboard.stats.apiCallsToday}
            value={overview ? overview.apiCallsToday.toLocaleString() : '—'}
            sub={copy.apiResetSub}
            accent={overview ? overview.apiCallsToday > 0 : false}
            href={routes.dashboard.partner.apiKeys}
          >
            {overview && (
              <UsageMeter used={overview.apiCallsToday} limit={overview.apiDailyLimit} />
            )}
          </StatCard>
        </Grid>

        {/* ── FX rate card ──────────────────────────────────────────────────── */}
        <div className="mt-4">
          <FxRateCard
            rateX100={fxRate?.rateX100 ?? null}
            fetchedAt={fxRate?.fetchedAt ?? null}
            source={fxRate?.source ?? null}
          />
        </div>

        {/* ── Approaching limit warning (50–80%) ───────────────────────────── */}
        {overview && (() => {
          const pct = overview.apiCallsToday / overview.apiDailyLimit;
          return pct >= 0.5 && pct < 0.8;
        })() && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5 min-w-0">
              <Warning
                className="mt-0.5 size-4 shrink-0 text-warning"
                weight="duotone"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {copy.approachingLimitBanner.heading(
                    Math.round((overview.apiCallsToday / overview.apiDailyLimit) * 100),
                  )}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {copy.approachingLimitBanner.body}
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 min-h-11">
              <Link href={routes.dashboard.partner.apiKeys} className="inline-flex items-center gap-1.5">
                {copy.approachingLimitBanner.cta}
                <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        )}

        {/* ── High usage callout ────────────────────────────────────────────── */}
        {overview && overview.apiCallsToday / overview.apiDailyLimit >= 0.8 && (
          <div className="mt-4">
            <PartnerHighUsageCallout
              used={overview.apiCallsToday}
              limit={overview.apiDailyLimit}
            />
          </div>
        )}

        {/* ── Integration summary ───────────────────────────────────────────── */}
        {overview?.totalStudents !== undefined && (
          <div className="mt-6 rounded-xl border border-border bg-card px-5 py-4 shadow-xs">
            <p className="text-sm text-muted-foreground">
              {overview.totalStudents > 0
                ? copy.summary.withStudents(overview.verifiedStudents, overview.totalStudents)
                : copy.summary.empty}
            </p>
          </div>
        )}

        {/* ── API usage table ───────────────────────────────────────────────── */}
        {usage && usage.byEndpoint.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {partnerCopy.dashboard.usage.title}
              </p>
              <Link
                href={routes.dashboard.partner.apiKeys}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary/70 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                <span>{copy.stats.activeApiKeys.label}</span>
                <ArrowRight className="size-3" weight="duotone" aria-hidden="true" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {partnerCopy.dashboard.usage.table.endpoint}
                    </th>
                    <th className="px-5 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                      <td className="px-5 py-3 font-mono text-foreground">
                        {row.endpoint}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                        {row.requestCount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="min-h-11 w-full sm:w-auto">
            <Link href={routes.dashboard.partner.students}>{copy.cta}</Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
            <Link href={routes.dashboard.partner.apiKeys} className="inline-flex items-center gap-1.5">
              <Key className="size-4" weight="duotone" aria-hidden="true" />
              {copy.stats.activeApiKeys.label}
            </Link>
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
