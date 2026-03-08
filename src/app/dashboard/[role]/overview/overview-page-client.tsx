'use client';

import { UniversityOverviewMetrics } from '@/components/university/UniversityOverviewMetrics';
import { EmptyState } from '@/components/ui/empty-state';
import { universityCopy } from '@/config/copy/university';

interface UniversityOverviewData {
  totalPrograms: number;
  enrolledStudents: number;
  pendingApplications: number;
  totalStudents: number;
}

interface OverviewPageClientProps {
  data: UniversityOverviewData;
}

const copy = universityCopy.overview;

export function OverviewPageClient({ data }: OverviewPageClientProps) {
  const isEmpty =
    data.totalPrograms === 0 &&
    data.enrolledStudents === 0 &&
    data.pendingApplications === 0 &&
    data.totalStudents === 0;

  return (
    <div className="space-y-6">
      <UniversityOverviewMetrics
        totalPrograms={data.totalPrograms}
        enrolledStudents={data.enrolledStudents}
        pendingApplications={data.pendingApplications}
        totalStudents={data.totalStudents}
      />

      {isEmpty ? (
        <EmptyState
          heading={copy.empty.heading}
          body={copy.empty.body}
          action={{ label: copy.empty.action, href: copy.empty.actionHref }}
        />
      ) : null}
    </div>
  );
}
