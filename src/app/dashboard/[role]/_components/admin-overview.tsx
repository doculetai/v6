import {
  ClipboardText,
  CheckCircle,
  ShieldWarning,
  Clock,
  ChartBar,
} from '@phosphor-icons/react/dist/ssr';

import {
  Grid,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { adminCopy } from '@/config/copy/admin';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';

type AdminOverviewProps = {
  caller: Awaited<ReturnType<typeof api>>;
};

export async function AdminOverview({ caller }: AdminOverviewProps) {
  const copy = adminCopy.overview;

  const [statsResult, riskResult, queueResult] = await Promise.allSettled([
    caller.admin.getOperationsStats(),
    caller.admin.getRiskFlags(),
    caller.admin.getOperationsQueue({ limit: 5 }),
  ]);

  const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;
  const riskFlags = riskResult.status === 'fulfilled' ? riskResult.value : [];
  const recentQueue = queueResult.status === 'fulfilled' ? queueResult.value : [];

  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="md">
          {/* Eyebrow + H1 */}
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
              {copy.eyebrow}
            </p>
            <PageHeader title={copy.title} />
          </div>

          {/* KPI pills strip */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: copy.kpi.apiUptime, value: copy.kpi.apiUptimeValue, ok: true },
              {
                label: copy.kpi.reviewQueue,
                value: String(stats?.pending ?? 0),
                ok: (stats?.pending ?? 0) < 10,
              },
              {
                label: copy.kpi.riskFlags,
                value: String(riskFlags.length),
                ok: riskFlags.length === 0,
              },
              {
                label: copy.kpi.certsIssued,
                value: String(stats?.approvedToday ?? 0),
                ok: true,
              },
            ].map((pill) => (
              <div
                key={pill.label}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
                  pill.ok
                    ? 'border-success/30 bg-success/10 text-success'
                    : 'border-destructive/30 bg-destructive/10 text-destructive',
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    pill.ok ? 'bg-success' : 'bg-destructive',
                  )}
                />
                {pill.label}:{' '}
                <span className="font-mono">{pill.value}</span>
              </div>
            ))}
          </div>

          {/* 4 stat cards */}
          <Grid cols={{ sm: 2, lg: 4 }} gap="md">
            <StatCard
              icon={
                <ClipboardText
                  className="size-4.5"
                  weight="duotone"
                  aria-hidden="true"
                />
              }
              label={copy.stats.pendingReview.label}
              value={stats ? String(stats.pending) : '—'}
              sub={copy.stats.pendingReview.sub}
              accent={Boolean(stats?.pending)}
            />
            <StatCard
              icon={
                <CheckCircle
                  className="size-4.5"
                  weight="duotone"
                  aria-hidden="true"
                />
              }
              label={copy.stats.approvedToday.label}
              value={stats ? String(stats.approvedToday) : '—'}
              sub={copy.stats.approvedToday.sub}
            />
            <StatCard
              icon={
                <ChartBar
                  className="size-4.5"
                  weight="duotone"
                  aria-hidden="true"
                />
              }
              label={copy.stats.platformBalance.label}
              value="—"
              sub={copy.stats.platformBalance.sub}
            />
            <StatCard
              icon={
                <ShieldWarning
                  className="size-4.5"
                  weight="duotone"
                  aria-hidden="true"
                />
              }
              label={copy.stats.riskFlags.label}
              value={String(riskFlags.length)}
              sub={copy.stats.riskFlags.sub}
              accent={riskFlags.length > 0}
            />
          </Grid>

          {/* Activity timeline */}
          <div className="rounded-xl border border-border bg-card px-5 py-5 shadow-xs">
            <p className="pb-3 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
              {copy.activity.heading}
            </p>
            {recentQueue.length > 0 ? (
              <div className="flex flex-col divide-y divide-border/50">
                {recentQueue.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 py-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Clock
                        className="size-3.5 text-muted-foreground"
                        weight="duotone"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.studentEmail}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.type} · {item.status}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat('en-NG', {
                        day: 'numeric',
                        month: 'short',
                      }).format(item.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {copy.activity.empty}
              </p>
            )}
          </div>
        </Stack>
      </Section>
    </PageShell>
  );
}
