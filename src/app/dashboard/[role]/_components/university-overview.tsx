import { ArrowRight, Buildings, Clock, GraduationCap } from '@/components/icons';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import {
  Grid,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { universityCopy } from '@/config/copy/university';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';
import { routes } from '@/config/routes';

type UniversityOverviewProps = {
  caller: Awaited<ReturnType<typeof api>>;
};

function formatNgn(kobo: number): string {
  const naira = kobo / 100;
  if (naira >= 1_000_000) return `₦ ${(naira / 1_000_000).toFixed(1)}M`;
  if (naira >= 1_000) return `₦ ${(naira / 1_000).toFixed(0)}k`;
  return `₦ ${naira.toLocaleString('en-NG')}`;
}

export async function UniversityOverview({ caller }: UniversityOverviewProps) {
  const copy = universityCopy.overview;

  const [overviewResult] = await Promise.allSettled([
    caller.university.getOverview(),
  ]);

  const data = overviewResult.status === 'fulfilled' ? overviewResult.value : null;

  const totalPrograms = data?.totalPrograms ?? 0;
  const enrolledStudents = data?.enrolledStudents ?? 0;
  const pendingApplications = data?.pendingApplications ?? 0;
  const certsIssued = data?.certsIssued ?? 0;
  const avgProofTargetKobo = data?.avgProofTargetKobo ?? 0;
  const programRows = data?.programs ?? [];

  // Derive next action — only when no programmes exist (true "get started" state)
  const nextAction =
    totalPrograms === 0 ? universityCopy.journey.nextActions.manage_programmes : null;

  // Anxiety peaks — students in verification pipeline, no university action needed
  const showPendingBanner = totalPrograms > 0 && pendingApplications > 0;

  const isEmpty = totalPrograms === 0 && enrolledStudents === 0;

  return (
    <PageShell width="wide">
      <Section>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/40">
            {copy.subtitle}
          </p>
          <h1 className="mt-1 text-[26px] font-bold tracking-[-0.025em] text-foreground">
            {copy.title}
          </h1>
        </div>

        {/* ── Next action ──────────────────────────────────────────────────── */}
        {nextAction && (
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/[0.04] px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/70">
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
            label={copy.metrics.totalStudents}
            value={String(enrolledStudents)}
            sub={universityCopy.students.subtitle}
            accent={enrolledStudents > 0}
            href={routes.dashboard.university.students}
          />
          <StatCard
            label={copy.metrics.certsIssued}
            value={String(certsIssued)}
            sub={copy.metrics.certsIssuedSub}
            accent={certsIssued > 0}
            href={routes.dashboard.university.students}
          />
          <StatCard
            label={copy.metrics.totalPrograms}
            value={String(totalPrograms)}
            sub={universityCopy.programs.subtitle}
            href={routes.dashboard.university.programs}
          />
          <StatCard
            label={copy.metrics.avgProofTarget}
            value={avgProofTargetKobo > 0 ? formatNgn(avgProofTargetKobo) : '—'}
            sub={copy.metrics.avgProofTargetSub}
            href={routes.dashboard.university.programs}
          />
        </Grid>

        {/* ── Anxiety peaks: students in verification pipeline ─────────── */}
        {showPendingBanner && (
          <div
            role="status"
            className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3 min-w-0">
              <Clock
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                weight="duotone"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {copy.pendingApplicationsBanner.heading(pendingApplications)}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {copy.pendingApplicationsBanner.body}
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 min-h-11">
              <Link href={routes.dashboard.university.pipeline} className="inline-flex items-center gap-1.5">
                {copy.pendingApplicationsBanner.cta}
                <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        )}

        {/* ── Programs table with progress ─────────────────────────────── */}
        {!isEmpty && programRows.length > 0 && (
          <div className="mb-6">
            <SectionHeader
              title={copy.programmes.heading}
              action={
                <Link
                  href={routes.dashboard.university.programs}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary/70 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  <span>{copy.programmes.manageLink}</span>
                  <ArrowRight className="size-3" weight="duotone" aria-hidden="true" />
                </Link>
              }
            />
            <ul role="list" className="divide-y divide-border">
              {programRows.map((prog) => {
                const total = prog.enrolledCount;
                const pct = total > 0 ? Math.round((prog.certsIssued / total) * 100) : 0;
                return (
                  <li key={prog.id} className="px-4 py-3.5">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{prog.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {prog.enrolledCount} {copy.programmes.enrolled} &middot; {prog.certsIssued} {copy.programmes.certs}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-foreground font-mono">
                        {pct}%
                      </span>
                    </div>
                    <div
                      className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${prog.name} — ${pct}% ${copy.programmes.certifiedAriaLabel}`}
                    >
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-primary' : 'bg-muted-foreground/40',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

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
