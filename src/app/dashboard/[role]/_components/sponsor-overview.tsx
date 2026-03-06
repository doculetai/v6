import { ArrowRight, CheckCircle, Money, GraduationCap, ShieldCheck, UserFocus } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Grid,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { JourneyProgress } from '@/components/ui/journey-progress';
import { sponsorCopy } from '@/config/copy/sponsor';
import { getFirstName } from '@/lib/get-first-name';
import { computeSponsorJourney } from '@/lib/journey/sponsor';
import { cn, formatNGN } from '@/lib/utils';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';

type SponsorOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

export async function SponsorOverview({ email, caller }: SponsorOverviewProps) {
  const firstName = getFirstName(email);
  const [overviewResult, studentsResult] = await Promise.allSettled([
    caller.sponsor.getSponsorOverview(),
    caller.sponsor.listSponsoredStudents(),
  ]);

  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const students = studentsResult.status === 'fulfilled' ? studentsResult.value : [];
  const recentStudents = students.slice(0, 3);
  const copy = sponsorCopy.dashboard.overview;
  const journeyState = computeSponsorJourney(
    {
      pendingInvites: overview?.pendingInvites ?? 0,
      activeStudents: overview?.activeStudents ?? 0,
      totalCommittedKobo: overview?.totalCommittedKobo ?? 0,
      nextDisbursementAt: overview?.nextDisbursementAt ?? null,
    },
    sponsorCopy.journey,
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

        {(overview?.pendingInvites ?? 0) > 0 && (
          <Card className="border-primary/20 bg-primary/5 mt-6">
            <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <CheckCircle
                  className="size-5 shrink-0 text-primary mt-0.5"
                  weight="duotone"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-foreground">
                  {copy.pendingInvitesBanner.message}
                </p>
              </div>
              <Button asChild size="sm" variant="default" className="shrink-0">
                <Link href={copy.pendingInvitesBanner.href} className="inline-flex items-center gap-1.5">
                  {copy.pendingInvitesBanner.cta}
                  <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Grid cols={{ sm: 2, lg: 4 }} gap="md" className="mt-6">
          <StatCard
            icon={<Money className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.totalCommitted.label}
            value={overview ? formatNGN(overview.totalCommittedKobo) : '—'}
            sub={copy.stats.totalCommitted.sub}
            accent={Boolean(overview?.totalCommittedKobo)}
          />
          <StatCard
            icon={<GraduationCap className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.activeStudents.label}
            value={overview ? String(overview.activeStudents) : '—'}
            sub={copy.stats.activeStudents.sub}
            accent={Boolean(overview?.activeStudents)}
          />
          <StatCard
            icon={<UserFocus className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.pendingInvites.label}
            value={overview ? String(overview.pendingInvites) : '—'}
            sub={copy.stats.pendingInvites.sub}
            accent={Boolean(overview?.pendingInvites)}
          />
          <StatCard
            icon={<ShieldCheck className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.nextDisbursement.label}
            value={
              overview?.nextDisbursementAt
                ? new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short' }).format(
                    overview.nextDisbursementAt,
                  )
                : copy.stats.nextDisbursement.noneValue
            }
            sub={
              overview?.nextDisbursementAt
                ? copy.stats.nextDisbursement.scheduledSub
                : copy.stats.nextDisbursement.noneSub
            }
          />
        </Grid>

        {recentStudents.length > 0 ? (
          <Stack gap="md" className="mt-6">
            <h2 className="text-sm font-semibold text-foreground">{copy.recentStudents.heading}</h2>
            <Stack gap="sm">
              {recentStudents.map((s) => (
                <Card key={s.id} className="border-border bg-card">
                  <CardContent className="flex items-center justify-between pt-4">
                    <div>
                      <Link
                        href={`/dashboard/sponsor/students/${s.id}`}
                        className="text-sm font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      >
                        {s.studentEmail ?? copy.recentStudents.unknownStudentLabel}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatNGN(s.amountKobo)} · {s.status}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        s.status === 'active'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {s.status}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Stack>
        ) : (
          <Card className="border-border bg-card mt-6">
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{copy.recentStudents.empty}</p>
            </CardContent>
          </Card>
        )}

        <Button asChild className="min-h-11 w-full sm:w-auto mt-6">
          <Link href="/dashboard/sponsor/students">{copy.cta}</Link>
        </Button>
      </Section>
    </PageShell>
  );
}
