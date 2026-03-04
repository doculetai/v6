'use client';

import Link from 'next/link';

import { UniversityOverviewActivity } from '@/components/university/UniversityOverviewActivity';
import { UniversityOverviewMetrics } from '@/components/university/UniversityOverviewMetrics';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { universityCopy } from '@/config/copy/university';
interface RecentDocument {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested';
  type: 'passport' | 'bank_statement' | 'offer_letter' | 'affidavit' | 'cac';
  createdAt: string;
}

interface UniversityOverviewData {
  pendingCount: number;
  approvedTodayCount: number;
  flaggedCount: number;
  totalStudents: number;
  recentActivity: RecentDocument[];
}

interface OverviewPageClientProps {
  data: UniversityOverviewData;
}

const copy = universityCopy.overview;

export function OverviewPageClient({ data }: OverviewPageClientProps) {
  const isEmpty =
    data.pendingCount === 0 &&
    data.approvedTodayCount === 0 &&
    data.flaggedCount === 0 &&
    data.totalStudents === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <Button asChild size="sm" variant="outline" className="min-h-11">
            <Link href="/dashboard/university/pipeline">{universityCopy.nav.pipeline}</Link>
          </Button>
        }
      />

      <UniversityOverviewMetrics
        pendingCount={data.pendingCount}
        approvedTodayCount={data.approvedTodayCount}
        flaggedCount={data.flaggedCount}
        totalStudents={data.totalStudents}
      />

      {isEmpty ? (
        <EmptyState
          heading={copy.empty.heading}
          body={copy.empty.body}
          action={{ label: copy.empty.action, href: copy.empty.actionHref }}
        />
      ) : (
        <UniversityOverviewActivity items={data.recentActivity} />
      )}
    </div>
  );
}
