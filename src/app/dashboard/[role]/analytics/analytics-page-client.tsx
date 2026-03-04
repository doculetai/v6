'use client';

import { AdminAnalyticsChart } from '@/components/admin/AdminAnalyticsChart';
import { AdminAnalyticsMetrics } from '@/components/admin/AdminAnalyticsMetrics';
import {
  AdminTopUniversities,
  BreakdownList,
} from '@/components/admin/AdminAnalyticsTables';
import { PageHeader } from '@/components/ui/page-header';
import { adminCopy } from '@/config/copy/admin';

import type { AdminAnalyticsData } from '@/db/queries/admin-analytics';

interface AnalyticsPageClientProps {
  data: AdminAnalyticsData;
}

const copy = adminCopy.analytics;

export function AnalyticsPageClient({ data }: AnalyticsPageClientProps) {
  const fundingLabelMap = copy.fundingBreakdown.types as Record<string, string>;
  const docStatusLabelMap = copy.documentStatus.statuses as Record<string, string>;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <AdminAnalyticsMetrics data={data} />

      <AdminAnalyticsChart
        byWeek={data.applicationsByWeek}
        byMonth={data.applicationsByMonth}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AdminTopUniversities universities={data.topUniversities} className="lg:col-span-1" />
        <BreakdownList
          title={copy.documentStatus.title}
          items={data.documentStatusBreakdown}
          labelMap={docStatusLabelMap}
          empty={copy.documentStatus.empty}
          className="lg:col-span-1"
        />
        <BreakdownList
          title={copy.fundingBreakdown.title}
          items={data.fundingBreakdown}
          labelMap={fundingLabelMap}
          empty={copy.fundingBreakdown.empty}
          className="lg:col-span-1"
        />
      </div>
    </div>
  );
}
