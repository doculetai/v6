import { MetricCard } from '@/components/ui/metric-card';
import { universityCopy } from '@/config/copy/university';

const copy = universityCopy.students.metrics;

interface UniversityStudentsMetricsProps {
  total: number;
  kycVerified: number;
  kycPending: number;
  kycFailed: number;
}

export function UniversityStudentsMetrics({
  total,
  kycVerified,
  kycPending,
  kycFailed,
}: UniversityStudentsMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard label={copy.total} value={total} />
      <MetricCard label={copy.verified} value={kycVerified} />
      <MetricCard label={copy.pending} value={kycPending} />
      <MetricCard label={copy.failed} value={kycFailed} />
    </div>
  );
}

export function UniversityStudentsMetricsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <MetricCard key={i} label="" value="" loading />
      ))}
    </div>
  );
}
