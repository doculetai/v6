import { MetricCard } from '@/components/ui/metric-card';
import { universityCopy } from '@/config/copy/university';

interface UniversityOverviewMetricsProps {
  pendingCount: number;
  approvedTodayCount: number;
  flaggedCount: number;
  totalStudents: number;
}

const copy = universityCopy.overview.metrics;

export function UniversityOverviewMetrics({
  pendingCount,
  approvedTodayCount,
  flaggedCount,
  totalStudents,
}: UniversityOverviewMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label={copy.pending}
        value={pendingCount}
        deltaDirection={pendingCount > 0 ? 'up' : 'neutral'}
      />
      <MetricCard
        label={copy.approvedToday}
        value={approvedTodayCount}
        deltaDirection={approvedTodayCount > 0 ? 'up' : 'neutral'}
      />
      <MetricCard
        label={copy.flagged}
        value={flaggedCount}
        deltaDirection={flaggedCount > 0 ? 'down' : 'neutral'}
      />
      <MetricCard
        label={copy.totalStudents}
        value={totalStudents}
      />
    </div>
  );
}
