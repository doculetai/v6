'use client';

import { TierBadge } from '@/components/partner/TierBadge';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import type { partnerCopy } from '@/config/copy/partner';

type StudentRow = {
  id: string;
  studentId: string;
  tier: number;
  verifiedAt: Date;
  schoolName: string | null;
};

type StudentsPageClientProps = {
  students: StudentRow[];
  copy: typeof partnerCopy.students;
};

export function StudentsPageClient({ students, copy }: StudentsPageClientProps) {
  const columns = [
    {
      key: 'studentId' as const,
      header: copy.table.studentId,
      cell: (row: StudentRow) => (
        <span className="font-mono text-sm text-foreground">
          ···{row.studentId.slice(-8)}
        </span>
      ),
    },
    {
      key: 'schoolName' as const,
      header: copy.table.university,
      cell: (row: StudentRow) => (
        <span className="text-sm text-foreground">
          {row.schoolName ?? <span className="text-muted-foreground">—</span>}
        </span>
      ),
    },
    {
      key: 'tier' as const,
      header: copy.table.tier,
      cell: (row: StudentRow) => {
        const tier = row.tier as 1 | 2 | 3;
        const label = copy.tierLabels[tier] ?? `Tier ${tier}`;
        return <TierBadge tier={row.tier} label={label} />;
      },
    },
    {
      key: 'verifiedAt' as const,
      header: copy.table.verifiedDate,
      cell: (row: StudentRow) => <TimestampLabel value={row.verifiedAt} mode="both" />,
    },
  ];

  if (students.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <EmptyState heading={copy.empty.title} body={copy.empty.description} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <DataTableShell columns={columns} rows={students} />
    </div>
  );
}
