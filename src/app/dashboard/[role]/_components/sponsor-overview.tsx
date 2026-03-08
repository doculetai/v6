import { GraduationCap, Medal, Money, UserFocus } from '@phosphor-icons/react/dist/ssr';

import {
  Grid,
  PageHeader,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn, formatNGN } from '@/lib/utils';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';

type SponsorOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

export async function SponsorOverview({ email: _email, caller }: SponsorOverviewProps) {
  const [overviewResult, studentsResult] = await Promise.allSettled([
    caller.sponsor.getSponsorOverview(),
    caller.sponsor.listSponsoredStudents(),
  ]);

  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const students = studentsResult.status === 'fulfilled' ? studentsResult.value : [];
  const copy = sponsorCopy.dashboard.overview;

  return (
    <PageShell width="wide">
      <Section>
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
          {copy.eyebrow}
        </p>
        <PageHeader title={copy.title} />

        <Grid cols={{ sm: 2, lg: 4 }} gap="md" className="mt-6">
          <StatCard
            icon={<GraduationCap className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.activeStudents.label}
            value={overview ? String(overview.activeStudents) : '—'}
            sub={copy.stats.activeStudents.sub}
            accent={Boolean(overview?.activeStudents)}
          />
          <StatCard
            icon={<Money className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.totalCommitted.label}
            value={overview ? formatNGN(overview.totalCommittedKobo) : '—'}
            sub={copy.stats.totalCommitted.sub}
            accent={Boolean(overview?.totalCommittedKobo)}
          />
          <StatCard
            icon={<Medal className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.certsIssued.label}
            value="0"
            sub={copy.stats.certsIssued.sub}
          />
          <StatCard
            icon={<UserFocus className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.pendingInvites.label}
            value={overview ? String(overview.pendingInvites) : '—'}
            sub={copy.stats.pendingInvites.sub}
            accent={Boolean(overview?.pendingInvites)}
          />
        </Grid>

        <div className="mt-6 rounded-xl border border-border bg-card px-5 py-5 shadow-xs">
          <p className="pb-3 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
            {copy.yourStudents.heading}
          </p>
          {students.length > 0 ? (
            <div className="flex flex-col divide-y divide-border/50">
              {students.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-2.5">
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ backgroundColor: 'var(--role-accent-bg)', color: 'var(--role-accent)' }}
                    aria-hidden="true"
                  >
                    {(s.studentEmail ?? '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {s.studentEmail ?? copy.yourStudents.unknownLabel}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatNGN(s.amountKobo)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                      s.status === 'active'
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {copy.yourStudents.empty}
            </p>
          )}
        </div>
      </Section>
    </PageShell>
  );
}
