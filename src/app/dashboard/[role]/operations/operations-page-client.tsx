'use client';

import { useEffect, useState } from 'react';

import { AdminOperationsBulkBar } from '@/components/admin/AdminOperationsBulkBar';
import { AdminOperationsReviewDialog } from '@/components/admin/AdminOperationsReviewDialog';
import { AdminOperationsTable } from '@/components/admin/AdminOperationsTable';
import { FilterBar } from '@/components/ui/filter-bar';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { adminCopy } from '@/config/copy/admin';
import type { DocumentStatus, OperationsQueueRow, OperationsStats, StatusFilter } from '@/db/queries/admin-operations';
import { trpc } from '@/trpc/client';

interface OperationsPageClientProps {
  initialQueue: OperationsQueueRow[];
  initialStats: OperationsStats;
}

const STATUS_FILTER_CHIPS = [
  { key: 'all', labelKey: 'all' },
  { key: 'pending', labelKey: 'pending' },
  { key: 'approved', labelKey: 'approved' },
  { key: 'rejected', labelKey: 'rejected' },
  { key: 'more_info_requested', labelKey: 'moreInfoRequested' },
] as const;

export default function OperationsPageClient({
  initialQueue,
  initialStats,
}: OperationsPageClientProps) {
  const copy = adminCopy.operations;

  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [reviewTarget, setReviewTarget] = useState<OperationsQueueRow | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const utils = trpc.useUtils();

  const { data: queue = initialQueue, isLoading: queueLoading } =
    trpc.admin.getOperationsQueue.useQuery(
      { status: activeStatus, search: debouncedSearch || undefined },
      { initialData: activeStatus === 'all' && !debouncedSearch ? initialQueue : undefined },
    );

  const { data: stats = initialStats } = trpc.admin.getOperationsStats.useQuery(undefined, {
    initialData: initialStats,
  });

  const reviewMutation = trpc.admin.reviewDocument.useMutation({
    onSuccess: () => {
      void utils.admin.getOperationsQueue.invalidate();
      void utils.admin.getOperationsStats.invalidate();
      setReviewTarget(null);
    },
  });

  const bulkMutation = trpc.admin.bulkReviewDocuments.useMutation({
    onSuccess: () => {
      void utils.admin.getOperationsQueue.invalidate();
      void utils.admin.getOperationsStats.invalidate();
      setSelectedIds(new Set());
    },
  });

  function handleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSelectAll(checked: boolean) {
    setSelectedIds(checked ? new Set(queue.map((r) => r.id)) : new Set());
  }

  function handleBulkAction(status: DocumentStatus) {
    bulkMutation.mutate({ documentIds: Array.from(selectedIds), status });
  }

  function handleReviewDecision(status: DocumentStatus, reason?: string) {
    if (!reviewTarget) return;
    reviewMutation.mutate({ documentId: reviewTarget.id, status, reason });
  }

  const filterChips = STATUS_FILTER_CHIPS.map((chip) => {
    const countMap: Record<string, number> = {
      all: stats.pending + stats.approved + stats.rejected + stats.moreInfoRequested,
      pending: stats.pending,
      approved: stats.approved,
      rejected: stats.rejected,
      more_info_requested: stats.moreInfoRequested,
    };
    return {
      key: chip.key,
      label: copy.filters[chip.labelKey as keyof typeof copy.filters] as string,
      count: countMap[chip.key] ?? 0,
    };
  });

  const isMutating = reviewMutation.isPending || bulkMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={copy.stats.pending} value={stats.pending} />
        <MetricCard
          label={copy.stats.approvedToday}
          value={stats.approvedToday}
          deltaDirection="up"
        />
        <MetricCard
          label={copy.stats.rejectedToday}
          value={stats.rejectedToday}
          deltaDirection="down"
        />
        <MetricCard label={copy.stats.moreInfo} value={stats.moreInfoRequested} />
      </div>

      {/* Filter bar */}
      <FilterBar
        query={searchQuery}
        queryPlaceholder={copy.filters.searchPlaceholder}
        chips={filterChips}
        activeChip={activeStatus}
        onQueryChange={setSearchQuery}
        onChipChange={(key) => {
          setActiveStatus(key as StatusFilter);
          setSelectedIds(new Set());
        }}
      />

      {/* Table */}
      <AdminOperationsTable
        rows={queueLoading ? [] : queue}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        onReview={setReviewTarget}
        emptyLabel={queueLoading ? undefined : copy.empty.description}
      />

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <AdminOperationsBulkBar
          count={selectedIds.size}
          onApprove={() => handleBulkAction('approved')}
          onReject={() => handleBulkAction('rejected')}
          onRequestInfo={() => handleBulkAction('more_info_requested')}
          onClear={() => setSelectedIds(new Set())}
          isLoading={isMutating}
        />
      )}

      {/* Review dialog */}
      <AdminOperationsReviewDialog
        row={reviewTarget}
        isOpen={reviewTarget !== null}
        onClose={() => setReviewTarget(null)}
        onDecision={handleReviewDecision}
        isLoading={isMutating}
      />
    </div>
  );
}
