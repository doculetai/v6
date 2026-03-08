import { GraduationCap, Medal, Money, UserFocus } from '@phosphor-icons/react/dist/ssr';

import {
  Grid,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { agentCopy } from '@/config/copy/agent';
import { cn, formatNGN } from '@/lib/utils';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';

type AgentOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

type StudentRow = {
  assignmentId: string;
  studentId: string;
  studentEmail: string | null;
  schoolName: string | null;
  programName: string | null;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  documentCount: number;
  assignedAt: Date;
};

export async function AgentOverview({ caller }: AgentOverviewProps) {
  const copy = agentCopy.dashboard.overview;

  const [overviewResult, studentsResult] = await Promise.allSettled([
    caller.agent.getAgentOverview(),
    caller.agent.listAgentStudents(),
  ]);

  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const students: StudentRow[] =
    studentsResult.status === 'fulfilled' ? (studentsResult.value as StudentRow[]) : [];

  const certsIssued = 0;
  const pendingCount =
    overview ? overview.totalAssignedStudents - overview.activeStudents : 0;

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
              icon={
                <GraduationCap className="size-4.5" weight="duotone" aria-hidden="true" />
              }
              label={copy.stats.activeStudents.label}
              value={overview ? String(overview.activeStudents) : '—'}
              sub={copy.stats.activeStudents.sub}
              accent={Boolean(overview?.activeStudents)}
            />
            <StatCard
              icon={<Medal className="size-4.5" weight="duotone" aria-hidden="true" />}
              label={copy.stats.certsIssued.label}
              value={String(certsIssued)}
              sub={copy.stats.certsIssued.sub}
            />
            <StatCard
              icon={<Money className="size-4.5" weight="duotone" aria-hidden="true" />}
              label={copy.stats.commissions.label}
              value={overview ? formatNGN(overview.totalEarnedKobo) : '—'}
              sub={copy.stats.commissions.sub}
              accent={Boolean(overview?.totalEarnedKobo)}
            />
            <StatCard
              icon={<UserFocus className="size-4.5" weight="duotone" aria-hidden="true" />}
              label={copy.stats.pending.label}
              value={overview ? String(pendingCount) : '—'}
              sub={copy.stats.pending.sub}
            />
          </Grid>

          <div className="rounded-xl border border-border bg-card px-5 py-5 shadow-xs">
            <p className="pb-3 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
              {copy.recentStudents.heading}
            </p>
            {students.length > 0 ? (
              <div className="flex flex-col divide-y divide-border/50">
                {students.slice(0, 5).map((s) => (
                  <div key={s.assignmentId} className="flex items-center gap-3 py-2.5">
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                    >
                      {(s.studentEmail ?? '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {s.studentEmail ?? copy.recentStudents.unknownLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.schoolName ?? s.programName ?? '—'}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                        s.kycStatus === 'verified'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {agentCopy.students.kycLabels[s.kycStatus]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {copy.recentStudents.empty}
              </p>
            )}
          </div>
        </Stack>
      </Section>
    </PageShell>
  );
}
