import { Grid } from '@/components/layout/content-primitives';
import { StatCard } from '@/components/ui/stat-card';
import { universityCopy } from '@/config/copy/university';

interface UniversityOverviewMetricsProps {
  totalPrograms: number;
  enrolledStudents: number;
  pendingApplications: number;
  totalStudents: number;
}

const copy = universityCopy.overview.metrics;

export function UniversityOverviewMetrics({
  totalPrograms,
  enrolledStudents,
  pendingApplications,
  totalStudents,
}: UniversityOverviewMetricsProps) {
  return (
    <Grid cols={{ sm: 2, lg: 4 }} gap="md">
      <StatCard label={copy.totalPrograms} value={totalPrograms} />
      <StatCard label={copy.enrolledStudents} value={enrolledStudents} />
      <StatCard label={copy.pendingApplications} value={pendingApplications} />
      <StatCard label={copy.totalStudents} value={totalStudents} />
    </Grid>
  );
}
