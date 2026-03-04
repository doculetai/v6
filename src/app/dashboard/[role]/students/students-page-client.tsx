'use client';

import { useMemo, useState } from 'react';

import { UniversityStudentsMetrics } from '@/components/university/UniversityStudentsMetrics';
import { UniversityStudentsTierBadge } from '@/components/university/UniversityStudentsTierBadge';
import { DataTableShell } from '@/components/ui/data-table-shell';
import type { DataTableColumn } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterBar } from '@/components/ui/filter-bar';
import type { FilterChip } from '@/components/ui/filter-bar';
import { MoneyValue } from '@/components/ui/money-value';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import type { StatusBadgeStatus } from '@/components/ui/status-badge';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import { universityCopy } from '@/config/copy/university';
import type { UniversityStudentRow } from '@/db/queries/university-students';

const copy = universityCopy.students;

// ─── Status mapping ───────────────────────────────────────

function kycStatusToBadge(
  kycStatus: UniversityStudentRow['kycStatus'],
): StatusBadgeStatus {
  if (kycStatus === 'verified') return 'verified';
  if (kycStatus === 'failed') return 'rejected';
  return 'pending';
}

// ─── Table columns ────────────────────────────────────────

const columns: ReadonlyArray<DataTableColumn<UniversityStudentRow>> = [
  {
    key: 'email',
    header: copy.table.student,
    cell: (row) => (
      <span className="max-w-[180px] truncate text-sm font-medium text-foreground">
        {row.email}
      </span>
    ),
  },
  {
    key: 'kycStatus',
    header: copy.table.status,
    cell: (row) => (
      <StatusBadge
        status={kycStatusToBadge(row.kycStatus)}
        label={copy.statusLabels[row.kycStatus]}
        size="sm"
      />
    ),
  },
  {
    key: 'tier',
    header: copy.table.tier,
    cell: (row) => <UniversityStudentsTierBadge tier={row.tier} />,
  },
  {
    key: 'amountKobo',
    header: copy.table.funding,
    cell: (row) =>
      row.amountKobo > 0 ? (
        <MoneyValue amountMinor={row.amountKobo} display="compact" />
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    key: 'submittedAt',
    header: copy.table.submitted,
    cell: (row) => <TimestampLabel value={row.submittedAt} mode="relative" />,
  },
  {
    key: 'schoolName',
    header: copy.table.school,
    cell: (row) => {
      const parts = [row.schoolName, row.programName].filter(Boolean);
      return parts.length > 0 ? (
        <span className="text-sm text-foreground">{parts.join(' · ')}</span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      );
    },
  },
];

// ─── Filter logic ─────────────────────────────────────────

type StatusChip = 'all' | 'verified' | 'pending' | 'failed';

function matchesChip(row: UniversityStudentRow, chip: StatusChip): boolean {
  if (chip === 'all') return true;
  if (chip === 'verified') return row.kycStatus === 'verified';
  if (chip === 'failed') return row.kycStatus === 'failed';
  // pending = 'pending' | 'not_started'
  return row.kycStatus === 'pending' || row.kycStatus === 'not_started';
}

function matchesQuery(row: UniversityStudentRow, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    row.email.toLowerCase().includes(q) ||
    (row.schoolName?.toLowerCase().includes(q) ?? false) ||
    (row.programName?.toLowerCase().includes(q) ?? false)
  );
}

// ─── Component ────────────────────────────────────────────

interface StudentsPageClientProps {
  initialData: UniversityStudentRow[];
}

export function StudentsPageClient({ initialData }: StudentsPageClientProps) {
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState<StatusChip>('all');

  const metrics = useMemo(
    () => ({
      total: initialData.length,
      kycVerified: initialData.filter((s) => s.kycStatus === 'verified').length,
      kycPending: initialData.filter(
        (s) => s.kycStatus === 'pending' || s.kycStatus === 'not_started',
      ).length,
      kycFailed: initialData.filter((s) => s.kycStatus === 'failed').length,
    }),
    [initialData],
  );

  const chips: FilterChip[] = useMemo(
    () => [
      { key: 'all', label: copy.filters.all, count: initialData.length },
      { key: 'verified', label: copy.filters.verified, count: metrics.kycVerified },
      { key: 'pending', label: copy.filters.pending, count: metrics.kycPending },
      { key: 'failed', label: copy.filters.failed, count: metrics.kycFailed },
    ],
    [initialData.length, metrics],
  );

  const filteredStudents = useMemo(
    () =>
      initialData
        .filter((s) => matchesChip(s, activeChip))
        .filter((s) => matchesQuery(s, query)),
    [initialData, activeChip, query],
  );

  const isFiltered = query.trim() !== '' || activeChip !== 'all';

  return (
    <div className="space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <UniversityStudentsMetrics
        total={metrics.total}
        kycVerified={metrics.kycVerified}
        kycPending={metrics.kycPending}
        kycFailed={metrics.kycFailed}
      />

      <FilterBar
        query={query}
        queryPlaceholder={copy.search.placeholder}
        chips={chips}
        activeChip={activeChip}
        onQueryChange={setQuery}
        onChipChange={(key) => setActiveChip(key as StatusChip)}
      />

      {filteredStudents.length === 0 ? (
        <EmptyState
          heading={isFiltered ? copy.emptyFiltered.heading : copy.empty.heading}
          body={isFiltered ? copy.emptyFiltered.body : copy.empty.body}
        />
      ) : (
        <DataTableShell columns={columns} rows={filteredStudents} />
      )}
    </div>
  );
}
