import { ArrowRight, CheckCircle, Users } from '@/components/icons';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Grid,
  PageHeader,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { sponsorCopy } from '@/config/copy/sponsor';
import { getFirstName } from '@/lib/get-first-name';
import { computeSponsorJourney } from '@/lib/journey/sponsor';
import { cn, formatNGN } from '@/lib/utils';
import { api } from '@/trpc/server';

import { NextStepCard, StatCard } from './overview-shared';
import { routes } from '@/config/routes';

type SponsorOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

// ── Status badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const statusLabels = sponsorCopy.students.statusLabels;
  const label = status in statusLabels
    ? statusLabels[status as keyof typeof statusLabels]
    : status.charAt(0).toUpperCase() + status.slice(1);

  const className =
    status === 'active'
      ? 'bg-success/10 text-success'
      : status === 'completed'
        ? 'bg-primary/10 text-primary'
        : 'bg-muted text-muted-foreground';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
        className,
      )}
    >
      {label}
    </span>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export async function SponsorOverview({ email, caller }: SponsorOverviewProps) {
  const firstName = getFirstName(email);
  const [overviewResult, studentsResult] = await Promise.allSettled([
    caller.sponsor.getSponsorOverview(),
    caller.sponsor.listSponsoredStudents(),
  ]);

  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const students = studentsResult.status === 'fulfilled' ? studentsResult.value : [];
  const recentStudents = students.slice(0, 5);
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

  const totalCommitted = overview?.totalCommittedKobo ?? 0;
  const activeStudents = overview?.activeStudents ?? 0;
  const pendingInvites = overview?.pendingInvites ?? 0;
  const ngnToUsdRate = overview?.ngnToUsdRate ?? 0;
  const nextAction = journeyState.nextAction;

  function formatDual(kobo: number): string {
    const ngn = formatNGN(kobo);
    if (!ngnToUsdRate) return ngn;
    const usdAmount = Math.round((kobo / 100) * ngnToUsdRate);
    return `${ngn} · $${usdAmount.toLocaleString('en-US')} USD`;
  }

  return (
    <PageShell width="wide">
      <Section>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <PageHeader
          title={copy.welcomeTitle(firstName)}
          overline={copy.subtitle}
        />

        {/* ── Pending invites alert ────────────────────────────────────────── */}
        {pendingInvites > 0 && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/[0.04] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5 min-w-0">
              <CheckCircle
                className="mt-0.5 size-4 shrink-0 text-primary"
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
          </div>
        )}

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <Grid cols={{ sm: 2, lg: 4 }} gap="md" className="mb-6">
          <StatCard
            label={copy.stats.totalCommitted.label}
            value={totalCommitted > 0 ? formatDual(totalCommitted) : '—'}
            sub={copy.stats.totalCommitted.sub}
            accent={totalCommitted > 0}
            href={routes.dashboard.sponsor.commitments}
          />
          <StatCard
            label={copy.stats.activeStudents.label}
            value={String(activeStudents)}
            sub={copy.stats.activeStudents.sub}
            accent={activeStudents > 0}
            href={routes.dashboard.sponsor.students}
          />
          <StatCard
            label={copy.stats.pendingInvites.label}
            value={String(pendingInvites)}
            sub={copy.stats.pendingInvites.sub}
            accent={pendingInvites > 0}
            href={routes.dashboard.sponsor.students}
          />
          <StatCard
            label={copy.stats.nextDisbursement.label}
            value={
              overview?.nextDisbursementAt
                ? new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short' }).format(overview.nextDisbursementAt)
                : copy.stats.nextDisbursement.noneValue
            }
            sub={
              overview?.nextDisbursementAt
                ? copy.stats.nextDisbursement.scheduledSub
                : copy.stats.nextDisbursement.noneSub
            }
            href={routes.dashboard.sponsor.disbursements}
          />
        </Grid>

        {/* ── Next action ──────────────────────────────────────────────────── */}
        {nextAction && !journeyState.allComplete && (
          <div className="mb-6">
            <NextStepCard step={nextAction} index={journeyState.currentStageIndex} />
          </div>
        )}

        {/* ── Recent students ──────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {copy.recentStudents.heading}
            </p>
            <Link
              href={routes.dashboard.sponsor.students}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary/70 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <span>{sponsorCopy.nav.students}</span>
              <ArrowRight className="size-3" weight="duotone" aria-hidden="true" />
            </Link>
          </div>

          {recentStudents.length > 0 ? (
            <ul role="list" className="divide-y divide-border">
              {recentStudents.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/sponsor/students/${s.id}`}
                      className="text-sm font-medium text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {s.studentEmail ?? copy.recentStudents.unknownStudentLabel}
                    </Link>
                    <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                      {formatDual(s.amountKobo)}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <Users className="size-8 text-muted-foreground/50 mb-3" weight="duotone" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">{copy.recentStudents.empty}</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">{copy.recentStudents.emptyBody}</p>
              {/* No self-directed CTA — sponsors are invited by students */}
            </div>
          )}
        </div>

      </Section>
    </PageShell>
  );
}
