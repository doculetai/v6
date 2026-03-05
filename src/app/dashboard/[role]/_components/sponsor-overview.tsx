import { Banknote, GraduationCap, ShieldCheck, UserRoundSearch } from 'lucide-react';
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
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn, formatNGN } from '@/lib/utils';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';

type SponsorOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

function getFirstName(email: string): string {
  const raw = email.split('@')[0] ?? '';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

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

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description={copy.subtitle}
        />
        <Grid cols={{ sm: 2, lg: 4 }} gap="md">
        <StatCard
          icon={<Banknote className="size-4.5" aria-hidden="true" />}
          label={copy.stats.totalCommitted.label}
          value={overview ? formatNGN(overview.totalCommittedKobo) : '—'}
          sub={copy.stats.totalCommitted.sub}
          accent={Boolean(overview?.totalCommittedKobo)}
        />
        <StatCard
          icon={<GraduationCap className="size-4.5" aria-hidden="true" />}
          label={copy.stats.activeStudents.label}
          value={overview ? String(overview.activeStudents) : '—'}
          sub={copy.stats.activeStudents.sub}
          accent={Boolean(overview?.activeStudents)}
        />
        <StatCard
          icon={<UserRoundSearch className="size-4.5" aria-hidden="true" />}
          label={copy.stats.pendingInvites.label}
          value={overview ? String(overview.pendingInvites) : '—'}
          sub={copy.stats.pendingInvites.sub}
          accent={Boolean(overview?.pendingInvites)}
        />
        <StatCard
          icon={<ShieldCheck className="size-4.5" aria-hidden="true" />}
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
                    <p className="text-sm font-medium text-foreground">
                      {s.studentEmail ?? 'Unknown'}
                    </p>
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
