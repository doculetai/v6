import { MoneyValue } from '@/components/ui/money-value';
import { MetricCard } from '@/components/ui/metric-card';
import { adminCopy } from '@/config/copy/admin';

import type { AdminAnalyticsData } from '@/db/queries/admin-analytics';

interface AdminAnalyticsMetricsProps {
  data: AdminAnalyticsData;
}

const copy = adminCopy;

export function AdminAnalyticsMetrics({ data }: AdminAnalyticsMetricsProps) {
  const { overviewStats, approvalRate, avgReviewTimeHours } = data;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <MetricCard
        label={copy.dashboard.stats.totalUsers}
        value={overviewStats.totalUsers.toLocaleString('en-NG')}
      />
      <MetricCard
        label={copy.dashboard.stats.activeStudents}
        value={overviewStats.activeStudents.toLocaleString('en-NG')}
      />
      <MetricCard
        label={copy.analytics.metrics.approvalRate}
        value={`${approvalRate}%`}
        deltaLabel={copy.analytics.metrics.approvalRateSuffix}
        deltaDirection={approvalRate >= 80 ? 'up' : approvalRate >= 60 ? 'neutral' : 'down'}
      />
      <MetricCard
        label={copy.analytics.metrics.avgReviewTime}
        value={`${avgReviewTimeHours}h`}
        deltaLabel={copy.analytics.metrics.avgReviewTimeSuffix}
        deltaDirection="neutral"
      />
      <MetricCard
        label={copy.dashboard.stats.pendingDocuments}
        value={overviewStats.pendingDocuments.toLocaleString('en-NG')}
        deltaDirection={overviewStats.pendingDocuments > 50 ? 'down' : 'neutral'}
      />
      <MetricCard
        label={copy.dashboard.stats.certificatesIssued}
        value={overviewStats.certificatesIssued.toLocaleString('en-NG')}
        deltaDirection="up"
      />
      <MetricCard
        label={copy.dashboard.stats.revenueThisMonth}
        value={
          <MoneyValue amountMinor={overviewStats.revenueThisMonthKobo} display="compact" />
        }
      />
      <MetricCard
        label={copy.dashboard.stats.flaggedItems}
        value={overviewStats.flaggedItems.toLocaleString('en-NG')}
        deltaDirection={overviewStats.flaggedItems > 0 ? 'down' : 'neutral'}
      />
    </div>
  );
}
