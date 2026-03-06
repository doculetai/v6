import { Money, GraduationCap, ShieldCheck, Coins } from '@phosphor-icons/react/dist/ssr';
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
import { agentCopy } from '@/config/copy/agent';
import { getFirstName } from '@/lib/get-first-name';
import { computeAgentJourney } from '@/lib/journey/agent';
import { formatNGN } from '@/lib/utils';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';

type AgentOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

export async function AgentOverview({ email, caller }: AgentOverviewProps) {
  const firstName = getFirstName(email);
  const [overviewResult] = await Promise.allSettled([caller.agent.getAgentOverview()]);
  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const copy = agentCopy.dashboard.overview;
  const journeyState = computeAgentJourney(
    {
      totalAssignedStudents: overview?.totalAssignedStudents ?? 0,
      activeStudents: overview?.activeStudents ?? 0,
      totalEarnedKobo: overview?.totalEarnedKobo ?? 0,
    },
    agentCopy.journey,
  );

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
            icon={<GraduationCap className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.assignedStudents.label}
            value={overview ? String(overview.totalAssignedStudents) : '—'}
            sub={copy.stats.assignedStudents.sub}
            accent={Boolean(overview?.totalAssignedStudents)}
          />
          <StatCard
            icon={<ShieldCheck className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.activeStudents.label}
            value={overview ? String(overview.activeStudents) : '—'}
            sub={copy.stats.activeStudents.sub}
            accent={Boolean(overview?.activeStudents)}
          />
          <StatCard
            icon={<Money className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.pendingCommissions.label}
            value={overview ? formatNGN(overview.pendingCommissionsKobo) : '—'}
            sub={copy.stats.pendingCommissions.sub}
            accent={Boolean(overview?.pendingCommissionsKobo)}
          />
          <StatCard
            icon={<Coins className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.totalEarned.label}
            value={overview ? formatNGN(overview.totalEarnedKobo) : '—'}
            sub={copy.stats.totalEarned.sub}
            accent={Boolean(overview?.totalEarnedKobo)}
          />
        </Grid>

        <Card className="border-border bg-card mt-6">
        <CardContent className="pt-5">
          <p className="text-sm text-muted-foreground">
            {overview?.totalAssignedStudents
              ? overview.totalAssignedStudents === 1
                ? copy.caseload.filledSingle(overview.totalAssignedStudents)
                : copy.caseload.filledPlural(overview.totalAssignedStudents)
              : copy.caseload.empty}
          </p>
        </CardContent>
        </Card>

        <Button asChild className="min-h-11 w-full sm:w-auto mt-6">
          <Link href="/dashboard/agent/students">{copy.cta}</Link>
        </Button>
      </Section>
    </PageShell>
  );
}
