'use client';

import { Grid, PageHeader, PageShell, Stack } from '@/components/layout/content-primitives';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { partnerCopy } from '@/config/copy/partner';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

import { StatCard } from '../_components/overview-shared';

type PartnerOverviewData = {
  totalStudents: number;
  verifiedStudents: number;
  activeApiKeys: number;
  organizationName: string;
};

type UsageData = {
  total: number;
  dailyLimit: number;
  byEndpoint: { endpoint: string; requestCount: number }[];
};

type Props = {
  data: PartnerOverviewData | null;
  initialUsage: UsageData | null;
  copy: typeof partnerCopy.analytics;
};

function UsageBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-muted">
      <div
        className={cn(
          'h-2 rounded-full transition-all',
          pct > 80 ? 'bg-destructive' : 'bg-primary',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function PartnerAnalyticsPageClient({ data, initialUsage, copy }: Props) {
  const { data: usage } = trpc.partner.getApiUsage.useQuery(undefined, {
    initialData: initialUsage ?? undefined,
  });

  const usageCopy = partnerCopy.usageDetail;
  const totalCalls = usage?.total ?? 0;
  const dailyLimit = usage?.dailyLimit ?? 10_000;
  const utilisation = dailyLimit > 0 ? Math.round((totalCalls / dailyLimit) * 100) : 0;

  return (
    <PageShell>
      <PageHeader
        title={copy.title}
        description={
          data?.organizationName
            ? `${data.organizationName} — ${copy.subtitle}`
            : copy.subtitle
        }
      />
      <Stack gap="lg">

      {data === null ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.error.description}</p>
        </div>
      ) : (
        <Grid cols={{ sm: 3 }} gap="md">
          <StatCard
            label={copy.stats.totalStudents.label}
            value={data.totalStudents.toLocaleString()}
            sub={copy.stats.totalStudents.sub}
            accent={data.totalStudents > 0}
          />
          <StatCard
            label={copy.stats.verifiedStudents.label}
            value={data.verifiedStudents.toLocaleString()}
            sub={copy.stats.verifiedStudents.sub}
            accent={data.verifiedStudents > 0}
          />
          <StatCard
            label={copy.stats.activeApiKeys.label}
            value={data.activeApiKeys.toLocaleString()}
            sub={copy.stats.activeApiKeys.sub}
            accent={data.activeApiKeys > 0}
          />
        </Grid>
      )}

      {/* API usage breakdown */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            {usageCopy.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{usageCopy.subtitle}</p>
        </CardHeader>
        <CardContent>
          <Grid cols={{ sm: 3 }} gap="sm" className="mb-6">
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <span className="text-xs font-medium text-muted-foreground">
                {usageCopy.stats.totalCalls.label}
              </span>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {totalCalls.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{usageCopy.stats.totalCalls.sub}</p>
            </div>
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <span className="text-xs font-medium text-muted-foreground">
                {usageCopy.stats.dailyLimit.label}
              </span>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {dailyLimit.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{usageCopy.stats.dailyLimit.sub}</p>
            </div>
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <span className="text-xs font-medium text-muted-foreground">
                {usageCopy.stats.utilisation.label}
              </span>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {utilisation}%
              </p>
              <UsageBar value={totalCalls} max={dailyLimit} />
            </div>
          </Grid>

          {usage && usage.byEndpoint.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {usageCopy.table.endpoint}
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {usageCopy.table.calls}
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {usageCopy.table.share}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {usage.byEndpoint.map((row) => {
                      const share = totalCalls > 0 ? Math.round((row.requestCount / totalCalls) * 100) : 0;
                      return (
                        <tr key={row.endpoint} className="transition-colors hover:bg-muted/30">
                          <td className="px-4 py-2.5 font-mono text-sm text-foreground">
                            {row.endpoint}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                            {row.requestCount.toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                            {share}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul role="list" className="space-y-2 md:hidden">
                {usage.byEndpoint.map((row) => {
                  const share = totalCalls > 0 ? Math.round((row.requestCount / totalCalls) * 100) : 0;
                  return (
                    <li key={row.endpoint} className="rounded-lg border border-border bg-background/50 p-3">
                      <p className="font-mono text-sm text-foreground">{row.endpoint}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="tabular-nums">{row.requestCount.toLocaleString()} calls</span>
                        <span className="tabular-nums">{share}%</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <EmptyState
              heading={usageCopy.empty.title}
              body={usageCopy.empty.description}
            />
          )}
        </CardContent>
      </Card>
      </Stack>
    </PageShell>
  );
}
