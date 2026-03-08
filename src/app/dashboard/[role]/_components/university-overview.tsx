import { ArrowRight, Buildings, GraduationCap } from '@/components/icons';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Grid,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { universityCopy } from '@/config/copy/university';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';
import { routes } from '@/config/routes';

type UniversityOverviewProps = {
  caller: Awaited<ReturnType<typeof api>>;
};

export async function UniversityOverview({ caller }: UniversityOverviewProps) {
  const copy = universityCopy.overview;

  const [overviewResult] = await Promise.allSettled([
    caller.university.getOverview(),
  ]);

  const data = overviewResult.status === 'fulfilled' ? overviewResult.value : null;

  const totalPrograms = data?.totalPrograms ?? 0;
  const enrolledStudents = data?.enrolledStudents ?? 0;
  const pendingApplications = data?.pendingApplications ?? 0;
  const totalStudents = data?.totalStudents ?? 0;

  // Derive next action from state
  const nextAction =
    totalPrograms === 0
      ? universityCopy.journey.nextActions.manage_programmes
      : pendingApplications > 0
        ? universityCopy.journey.nextActions.monitor_enrolment
        : null;

  const isEmpty = totalPrograms === 0 && enrolledStudents === 0 && pendingApplications === 0;

  return (
    <PageShell width="wide">
      <Section>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">
            {copy.subtitle}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {copy.title}
          </h1>
        </div>

        {/* ── Next action ──────────────────────────────────────────────────── */}
        {nextAction && (
          <div className="mb-6 rounded-xl border-l-4 border-l-primary bg-primary/[0.03] px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
                  {nextAction.href === routes.dashboard.university.programs
                    ? copy.metrics.totalPrograms
                    : copy.metrics.pendingApplications}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{nextAction.label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{nextAction.description}</p>
              </div>
              <Button asChild size="sm" variant="default" className="shrink-0 min-h-11">
                <Link href={nextAction.href} className="inline-flex items-center gap-1.5">
                  {nextAction.cta}
                  <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <Grid cols={{ sm: 2, lg: 4 }} gap="md" className="mb-6">
          <StatCard
            label={copy.metrics.totalPrograms}
            value={String(totalPrograms)}
            sub={universityCopy.programs.subtitle}
            accent={totalPrograms > 0}
            href={routes.dashboard.university.programs}
          />
          <StatCard
            label={copy.metrics.enrolledStudents}
            value={String(enrolledStudents)}
            sub={universityCopy.students.subtitle}
            accent={enrolledStudents > 0}
            href={routes.dashboard.university.students}
          />
          <StatCard
            label={copy.metrics.pendingApplications}
            value={String(pendingApplications)}
            sub={universityCopy.pipeline.stats.pendingReview}
            accent={pendingApplications > 0}
            href={routes.dashboard.university.pipeline}
          />
          <StatCard
            label={copy.metrics.totalStudents}
            value={String(totalStudents)}
            sub={universityCopy.pipeline.stats.total}
            href={routes.dashboard.university.students}
          />
        </Grid>

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {isEmpty && (
          <div className="rounded-xl border border-border bg-card px-6 py-10 text-center shadow-xs">
            <Buildings className="mx-auto size-8 text-muted-foreground/50 mb-3" weight="duotone" aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">{copy.empty.heading}</p>
            <p className="mt-1 text-sm text-muted-foreground">{copy.empty.body}</p>
            <Button asChild size="sm" variant="default" className="mt-4 min-h-11">
              <Link href={copy.empty.actionHref}>{copy.empty.action}</Link>
            </Button>
          </div>
        )}

        {/* ── Pipeline CTA ─────────────────────────────────────────────────── */}
        {!isEmpty && (
          <div className="mt-2">
            <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
              <Link href={routes.dashboard.university.pipeline} className="inline-flex items-center gap-1.5">
                <GraduationCap className="size-4" weight="duotone" aria-hidden="true" />
                {universityCopy.nav.pipeline}
              </Link>
            </Button>
          </div>
        )}

      </Section>
    </PageShell>
  );
}
