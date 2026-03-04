'use client';

import { ActivityTimeline } from '@/components/ui/activity-timeline';
import type { ActivityTimelineItem } from '@/components/ui/activity-timeline';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { agentCopy } from '@/config/copy/agent';

interface AgentOverviewStats {
  totalStudents: number;
  activeStudents: number;
  pendingCommissions: number;
  totalEarned: number;
}

interface AgentOverviewPageClientProps {
  stats: AgentOverviewStats;
  activity: ActivityTimelineItem[];
}

// Commission values are stored in kobo; divide by 100 to display in ₦
const formatNaira = (kobo: number) =>
  new Intl.NumberFormat('en-NG', { style: 'decimal', maximumFractionDigits: 0 }).format(
    kobo / 100,
  );

export function AgentOverviewPageClient({ stats, activity }: AgentOverviewPageClientProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={agentCopy.dashboard.title}
        subtitle={agentCopy.dashboard.subtitle}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={agentCopy.dashboard.stats.totalStudents}
          value={stats.totalStudents}
        />
        <MetricCard
          label={agentCopy.dashboard.stats.activeStudents}
          value={stats.activeStudents}
        />
        <MetricCard
          label={agentCopy.dashboard.stats.pendingCommissions}
          value={`₦${formatNaira(stats.pendingCommissions)}`}
        />
        <MetricCard
          label={agentCopy.dashboard.stats.totalEarned}
          value={`₦${formatNaira(stats.totalEarned)}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2" aria-label={agentCopy.dashboard.studentList.title}>
          <h2 className="text-base font-semibold text-foreground">
            {agentCopy.dashboard.studentList.title}
          </h2>
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              heading={agentCopy.dashboard.studentList.empty.title}
              body={agentCopy.dashboard.studentList.empty.description}
              action={{
                label: agentCopy.dashboard.studentList.empty.cta,
                href: '/dashboard/agent/referral',
              }}
            />
          </div>
        </section>

        <section className="space-y-4" aria-label={agentCopy.dashboard.recentActivity.title}>
          <h2 className="text-base font-semibold text-foreground">
            {agentCopy.dashboard.recentActivity.title}
          </h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <ActivityTimeline
              items={activity}
              emptyLabel={agentCopy.dashboard.recentActivity.empty.description}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
