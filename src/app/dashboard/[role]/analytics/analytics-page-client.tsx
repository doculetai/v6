'use client';

import { ActivityTimeline } from '@/components/ui/activity-timeline';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { ApiUsageDailyChart } from '@/components/partner/ApiUsageDailyChart';
import { ApiUsageTable } from '@/components/partner/ApiUsageTable';
import { partnerCopy } from '@/config/copy/partner';
import type { PartnerAnalyticsOutput } from '@/server/routers/partner';

interface AnalyticsPageClientProps {
  data: PartnerAnalyticsOutput;
}

const copy = partnerCopy;

export function AnalyticsPageClient({ data }: AnalyticsPageClientProps) {
  const { stats, dailyCalls, usageRows, recentEvents } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={copy.analytics.title}
        subtitle={copy.analytics.subtitle}
      />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={copy.dashboard.stats.totalVerifications}
          value={stats.totalVerifications.toLocaleString()}
        />
        <MetricCard
          label={copy.dashboard.stats.certificatesIssued}
          value={stats.certificatesIssued.toLocaleString()}
        />
        <MetricCard
          label={copy.dashboard.stats.activeApiKeys}
          value={stats.activeApiKeys.toLocaleString()}
        />
        <MetricCard
          label={copy.dashboard.stats.apiCallsThisMonth}
          value={stats.apiCallsThisMonth.toLocaleString()}
        />
      </div>

      {/* Chart */}
      <section aria-labelledby="chart-heading">
        <h2
          id="chart-heading"
          className="mb-3 text-sm font-medium text-foreground"
        >
          {copy.analytics.chart.title}
        </h2>
        <ApiUsageDailyChart data={dailyCalls} />
      </section>

      {/* Usage table + recent events */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="usage-heading" className="space-y-3 lg:col-span-2">
          <h2
            id="usage-heading"
            className="text-sm font-medium text-foreground"
          >
            {copy.dashboard.usage.title}
          </h2>
          <ApiUsageTable rows={usageRows} />
        </section>

        <section aria-labelledby="activity-heading" className="space-y-3">
          <h2
            id="activity-heading"
            className="text-sm font-medium text-foreground"
          >
            {copy.dashboard.recentActivity.title}
          </h2>
          <ActivityTimeline
            items={recentEvents}
            emptyLabel={copy.dashboard.recentActivity.empty.description}
          />
        </section>
      </div>
    </div>
  );
}
