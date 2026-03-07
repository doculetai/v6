import { ArrowRight, Link as LinkIcon, ShieldCheck, Coins, UserFocus } from '@/components/icons';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Grid,
  PageHeader,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { JourneyProgress } from '@/components/ui/journey-progress';
import { SectionHeader } from '@/components/ui/section-header';
import { agentCopy } from '@/config/copy/agent';
import { getFirstName } from '@/lib/get-first-name';
import { computeAgentJourney } from '@/lib/journey/agent';
import { formatNGN } from '@/lib/utils';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';
import { routes } from '@/config/routes';

type AgentOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

export async function AgentOverview({ email, caller }: AgentOverviewProps) {
  const firstName = getFirstName(email);
  const [overviewResult] = await Promise.allSettled([caller.agent.getAgentOverview()]);
  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const copy = agentCopy.dashboard.overview;
  const referralCopy = agentCopy.referral.stats;
  const journeyState = computeAgentJourney(
    {
      totalAssignedStudents: overview?.totalAssignedStudents ?? 0,
      activeStudents: overview?.activeStudents ?? 0,
      totalEarnedKobo: overview?.totalEarnedKobo ?? 0,
    },
    agentCopy.journey,
  );

  const conversionRate =
    overview && overview.totalAssignedStudents > 0
      ? Math.round((overview.activeStudents / overview.totalAssignedStudents) * 100)
      : null;

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader
          title={copy.welcomeTitle(firstName)}
          description={copy.subtitle}
        />
        <JourneyProgress
          stages={journeyState.stages}
          nextAction={journeyState.nextAction}
          allComplete={journeyState.allComplete}
          completionMessage={journeyState.completionMessage}
        />

        <Grid cols={{ sm: 2, lg: 4 }} gap="md" className="mt-6">
          <StatCard
            label={copy.stats.assignedStudents.label}
            value={overview ? String(overview.totalAssignedStudents) : '—'}
            sub={copy.stats.assignedStudents.sub}
            accent={Boolean(overview?.totalAssignedStudents)}
            href={routes.dashboard.agent.students}
          />
          <StatCard
            label={copy.stats.activeStudents.label}
            value={overview ? String(overview.activeStudents) : '—'}
            sub={copy.stats.activeStudents.sub}
            accent={Boolean(overview?.activeStudents)}
            href={routes.dashboard.agent.students}
          />
          <StatCard
            label={copy.stats.pendingCommissions.label}
            value={overview ? formatNGN(overview.pendingCommissionsKobo) : '—'}
            sub={copy.stats.pendingCommissions.sub}
            accent={Boolean(overview?.pendingCommissionsKobo)}
            href={routes.dashboard.agent.commissions}
          />
          <StatCard
            label={copy.stats.totalEarned.label}
            value={overview ? formatNGN(overview.totalEarnedKobo) : '—'}
            sub={copy.stats.totalEarned.sub}
            accent={Boolean(overview?.totalEarnedKobo)}
            href={routes.dashboard.agent.commissions}
          />
        </Grid>

        {/* ── Referral performance ─────────────────────────────────────────── */}
        <div className="mt-6 rounded-xl border border-border bg-card shadow-xs">
          <SectionHeader
            title={agentCopy.referral.title}
            className="px-5 py-3.5 mb-0 pb-3.5"
            action={
              <Link
                href={routes.dashboard.agent.commissions}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary/70 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                <span>{agentCopy.commissions.title}</span>
                <ArrowRight className="size-3" weight="duotone" aria-hidden="true" />
              </Link>
            }
          />
          <div className="p-5">
            <Grid cols={{ sm: 3 }} gap="sm">
              <div className="rounded-lg border border-border bg-background/50 p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LinkIcon className="size-4" weight="duotone" aria-hidden="true" />
                  <span className="text-xs font-medium">{referralCopy.totalReferrals}</span>
                </div>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
                  {overview ? String(overview.totalAssignedStudents) : '\u2014'}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="size-4" weight="duotone" aria-hidden="true" />
                  <span className="text-xs font-medium">{referralCopy.converted}</span>
                </div>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
                  {overview ? String(overview.activeStudents) : '\u2014'}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Coins className="size-4" weight="duotone" aria-hidden="true" />
                  <span className="text-xs font-medium">{referralCopy.conversionRate}</span>
                </div>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
                  {conversionRate !== null ? `${conversionRate}%` : '\u2014'}
                </p>
              </div>
            </Grid>
          </div>
        </div>

        {/* ── Caseload summary ─────────────────────────────────────────────── */}
        {overview?.totalAssignedStudents === 0 && (
          <div className="mt-6 flex flex-col items-center rounded-xl border border-border bg-card px-6 py-10 text-center shadow-xs">
            <UserFocus className="size-8 text-muted-foreground/50 mb-3" weight="duotone" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">{copy.caseload.empty}</p>
            <Button asChild size="sm" variant="default" className="mt-4 min-h-11">
              <Link href={routes.dashboard.agent.students}>{copy.cta}</Link>
            </Button>
          </div>
        )}

        {overview && overview.totalAssignedStudents > 0 && (
          <div className="mt-4">
            <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
              <Link href={routes.dashboard.agent.students}>{copy.cta}</Link>
            </Button>
          </div>
        )}
      </Section>
    </PageShell>
  );
}
