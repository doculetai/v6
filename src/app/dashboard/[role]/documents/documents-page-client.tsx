'use client';

import { useState, useMemo } from 'react';

import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterBar } from '@/components/ui/filter-bar';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import { Button } from '@/components/ui/button';
import type { DataTableColumn } from '@/components/ui/data-table-shell';
import type { FilterChip } from '@/components/ui/filter-bar';
import type { StatusBadgeStatus } from '@/components/ui/status-badge';
import {
  UniversityDocumentReviewDialog,
} from '@/components/university/UniversityDocumentReviewDialog';
import type { DocumentRow, DocumentStats } from '@/components/university/document-row-types';
import { universityCopy } from '@/config/copy/university';

const copy = universityCopy.documents;

function toStatusBadge(status: DocumentRow['status']): StatusBadgeStatus {
  const map: Record<DocumentRow['status'], StatusBadgeStatus> = {
    pending: 'pending',
    approved: 'verified',
    rejected: 'rejected',
    more_info_requested: 'attention',
  };
  return map[status];
}

interface DocumentsPageClientProps {
  documents: DocumentRow[];
  stats: DocumentStats;
}

export function DocumentsPageClient({ documents, stats }: DocumentsPageClientProps) {
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState('all');
  const [reviewDocument, setReviewDocument] = useState<DocumentRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const chips: FilterChip[] = [
    { key: 'all', label: copy.filters.all, count: stats.total },
    { key: 'pending', label: copy.filters.pending, count: stats.pending },
    { key: 'approved', label: copy.filters.approved, count: stats.approved },
    { key: 'rejected', label: copy.filters.rejected },
    { key: 'more_info_requested', label: copy.filters.moreInfo, count: stats.moreInfoRequested },
  ];

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesChip = activeChip === 'all' || doc.status === activeChip;
      const matchesQuery =
        query.trim() === '' ||
        doc.studentEmail.toLowerCase().includes(query.toLowerCase().trim());
      return matchesChip && matchesQuery;
    });
  }, [documents, activeChip, query]);

  function openReview(doc: DocumentRow) {
    setReviewDocument(doc);
    setDialogOpen(true);
  }

  const columns: ReadonlyArray<DataTableColumn<DocumentRow>> = [
    {
      key: 'studentEmail',
      header: copy.table.student,
      className: 'max-w-[200px] truncate',
    },
    {
      key: 'type',
      header: copy.table.type,
      cell: (row) => (
        <span className="text-sm text-foreground">
          {copy.typeLabels[row.type]}
        </span>
      ),
    },
    {
      key: 'status',
      header: copy.table.status,
      cell: (row) => (
        <StatusBadge
          status={toStatusBadge(row.status)}
          label={copy.statusLabels[row.status]}
          size="sm"
        />
      ),
    },
    {
      key: 'createdAt',
      header: copy.table.submitted,
      cell: (row) => <TimestampLabel value={row.createdAt} mode="relative" />,
    },
    {
      key: 'id',
      header: copy.table.actions,
      className: 'text-right',
      cell: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openReview(row)}
          className="min-h-[44px] px-3"
        >
          {copy.actions.review}
        </Button>
      ),
    },
  ];

  const isEmpty = filteredDocuments.length === 0;
  const isFiltered = query.trim() !== '' || activeChip !== 'all';

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={copy.stats.total} value={String(stats.total)} />
        <MetricCard label={copy.stats.pending} value={String(stats.pending)} />
        <MetricCard label={copy.stats.approved} value={String(stats.approved)} />
        <MetricCard label={copy.stats.moreInfo} value={String(stats.moreInfoRequested)} />
      </div>

      {/* Filter bar */}
      <FilterBar
        query={query}
        queryPlaceholder={copy.filters.search}
        chips={chips}
        activeChip={activeChip}
        onQueryChange={setQuery}
        onChipChange={setActiveChip}
      />

      {/* Table or empty state */}
      {isEmpty ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            heading={isFiltered ? copy.emptyFiltered.title : copy.empty.title}
            body={isFiltered ? copy.emptyFiltered.body : copy.empty.body}
          />
        </div>
      ) : (
        <DataTableShell columns={columns} rows={filteredDocuments} />
      )}

      {/* Review dialog */}
      <UniversityDocumentReviewDialog
        document={reviewDocument}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
