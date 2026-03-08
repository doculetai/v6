import { ArrowRight, CheckCircle, ClipboardText, Warning, XCircle } from '@/components/icons';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import {
  Grid,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { adminCopy } from '@/config/copy/admin';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';
import { routes } from '@/config/routes';

type AdminOverviewProps = {
  caller: Awaited<ReturnType<typeof api>>;
};

function formatNgn(kobo: number): string {
  const naira = kobo / 100;
  if (naira >= 1_000_000_000) return `₦ ${(naira / 1_000_000_000).toFixed(2)}B`;
  if (naira >= 1_000_000) return `₦ ${(naira / 1_000_000).toFixed(1)}M`;
  if (naira >= 1_000) return `₦ ${(naira / 1_000).toFixed(0)}k`;
  return `₦ ${naira.toLocaleString('en-NG')}`;
}

type KpiPillProps = {
  label: string;
  value: string;
  status: 'up' | 'warn' | 'down';
};

function KpiPill({ label, value, status }: KpiPillProps) {
  const dotClass =
    status === 'up'
      ? 'bg-emerald-500'
      : status === 'warn'
        ? 'bg-amber-500'
        : 'bg-destructive';
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
      <span className={cn('size-1.5 shrink-0 rounded-full', dotClass)} aria-hidden="true" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}

export async function AdminOverview({ caller }: AdminOverviewProps) {
  const copy = adminCopy.overview;

  const [statsResult, riskResult, queueResult, fxResult, balanceResult, certsResult] =
    await Promise.allSettled([
      caller.admin.getOperationsStats(),
      caller.admin.getRiskFlags(),
      caller.admin.getOperationsQueue({ limit: 5 }),
      caller.admin.getLatestFxRate(),
      caller.admin.getPlatformBalance(),
      caller.admin.getCertsIssuedToday(),
    ]);

  const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;
  const riskFlags = riskResult.status === 'fulfilled' ? riskResult.value : [];
  const recentQueue = queueResult.status === 'fulfilled' ? queueResult.value : [];
  const fxRate = fxResult.status === 'fulfilled' ? fxResult.value : null;
  const platformBalanceKobo = balanceResult.status === 'fulfilled' ? balanceResult.value.totalKobo : null;
  const certsToday = certsResult.status === 'fulfilled' ? certsResult.value.count : 0;

  const hasPendingItems = (stats?.pending ?? 0) > 0 || riskFlags.length > 0;

  const platformBalanceLabel = platformBalanceKobo !== null
    ? formatNgn(platformBalanceKobo)
    : '—';

  const fxLabel = fxRate?.rateX100
    ? `≈ $1 @ ₦ ${(fxRate.rateX100 / 100).toLocaleString('en-NG')}`
    : null;

  return (
    <PageShell width="wide">
      <Section>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">
            {copy.subtitle}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {copy.welcomeTitle}
          </h1>
        </div>

        {/* ── Alert: items need attention ───────────────────────────────── */}
        {hasPendingItems && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/[0.04] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5 min-w-0">
              <Warning
                className="mt-0.5 size-4 shrink-0 text-primary"
                weight="duotone"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-foreground">
                {stats?.pending
                  ? `${stats.pending} document${stats.pending === 1 ? '' : 's'} pending review in the operations queue.`
                  : `${riskFlags.length} risk flag${riskFlags.length === 1 ? '' : 's'} require attention.`}
              </p>
            </div>
            <Button asChild size="sm" variant="default" className="shrink-0">
              <Link
                href={stats?.pending ? routes.dashboard.admin.operations : routes.dashboard.admin.risk}
                className="inline-flex items-center gap-1.5"
              >
                {stats?.pending ? adminCopy.journey.nextActions.review_queue.cta : adminCopy.journey.nextActions.resolve_flags.cta}
                <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        )}

        {/* ── KPI pills ─────────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap gap-2">
          <KpiPill
            label="Review queue"
            value={stats ? `${stats.pending} pending` : '—'}
            status={stats?.pending ? 'warn' : 'up'}
          />
          <KpiPill
            label="Risk flags"
            value={`${riskFlags.length} open`}
            status={riskFlags.length > 0 ? 'warn' : 'up'}
          />
          <KpiPill
            label="Certs issued"
            value={`${certsToday} today`}
            status="up"
          />
          {fxRate?.rateX100 ? (
            <KpiPill
              label="FX rate"
              value={`₦ ${(fxRate.rateX100 / 100).toLocaleString('en-NG')}/$`}
              status="up"
            />
          ) : null}
        </div>

        {/* ── Stat cards ───────────────────────────────────────────────── */}
        <Grid cols={{ sm: 2, lg: 4 }} gap="md" className="mb-6">
          <StatCard
            label={copy.stats.pendingReview.label}
            value={stats ? String(stats.pending) : '—'}
            sub={copy.stats.pendingReview.sub}
            accent={Boolean(stats?.pending)}
            href={routes.dashboard.admin.operations}
          />
          <StatCard
            label={copy.stats.approvedToday.label}
            value={stats ? String(stats.approvedToday) : '—'}
            sub={copy.stats.approvedToday.sub}
            href={routes.dashboard.admin.operations}
          />
          <StatCard
            label="Platform balance"
            value={platformBalanceLabel}
            sub={fxLabel ?? 'total verified funds'}
            href={routes.dashboard.admin.operations}
          />
          <StatCard
            label={copy.stats.riskFlags.label}
            value={String(riskFlags.length)}
            sub={copy.stats.riskFlags.sub}
            accent={riskFlags.length > 0}
            href={routes.dashboard.admin.risk}
          />
        </Grid>

        {/* ── Activity timeline ────────────────────────────────────────── */}
        <div>
          <SectionHeader
            title={copy.recentOperations.heading}
            action={
              <Link
                href={routes.dashboard.admin.operations}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary/70 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                <span>{adminCopy.nav.documents}</span>
                <ArrowRight className="size-3" weight="duotone" aria-hidden="true" />
              </Link>
            }
          />

          {recentQueue.length > 0 ? (
            <ul role="list" className="divide-y divide-border">
              {recentQueue.slice(0, 5).map((item) => {
                const isApproved = item.status === 'approved';
                const isRejected = item.status === 'rejected';
                const statusLabel =
                  item.status === 'more_info_requested'
                    ? adminCopy.operations.statusLabels.moreInfoRequested
                    : (adminCopy.operations.statusLabels[item.status] ?? item.status);
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                  >
                    <span className="shrink-0" aria-hidden="true">
                      {isApproved ? (
                        <CheckCircle className="size-4 text-emerald-600" weight="duotone" />
                      ) : isRejected ? (
                        <XCircle className="size-4 text-destructive" weight="duotone" />
                      ) : (
                        <ClipboardText className="size-4 text-muted-foreground" weight="duotone" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.studentEmail}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.type} &middot; {statusLabel}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat('en-NG', {
                        day: 'numeric',
                        month: 'short',
                      }).format(item.createdAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <ClipboardText className="size-8 text-muted-foreground/50 mb-3" weight="duotone" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">{copy.recentOperations.empty}</p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
            <Link href={routes.dashboard.admin.operations}>{copy.recentOperations.viewAll}</Link>
          </Button>
        </div>

      </Section>
    </PageShell>
  );
}
