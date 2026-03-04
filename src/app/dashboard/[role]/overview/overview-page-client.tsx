'use client';

import { partnerCopy } from '@/config/copy/partner';
import { ActivityTimeline } from '@/components/ui/activity-timeline';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { ApiUsageTable } from '@/components/partner/ApiUsageTable';
import { QuickLinksPanel } from '@/components/partner/QuickLinksPanel';
import type { PartnerOverview } from '@/server/routers/partner';

interface PartnerOverviewPageClientProps {
  overview: PartnerOverview;
}

export function PartnerOverviewPageClient({ overview }: PartnerOverviewPageClientProps) {
  const copy = partnerCopy.dashboard;

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
      />

      {/* Metrics row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={copy.stats.totalVerifications}
          value={overview.totalVerifications}
        />
        <MetricCard
          label={copy.stats.certificatesIssued}
          value={overview.certificatesIssued}
        />
        <MetricCard
          label={copy.stats.activeApiKeys}
          value={overview.activeApiKeys}
        />
        <MetricCard
          label={copy.stats.apiCallsThisMonth}
          value={overview.apiCallsThisMonth}
        />
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* API usage table */}
        <div className="lg:col-span-2">
          <ApiUsageTable />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">
              {copy.recentActivity.title}
            </h2>
            <ActivityTimeline
              items={[]}
              emptyLabel={copy.recentActivity.empty.description}
            />
          </div>
          <QuickLinksPanel />
        </div>
      </div>
    </section>
  );
}
