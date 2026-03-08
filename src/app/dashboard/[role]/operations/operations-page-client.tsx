'use client';

import { useEffect, useMemo, useState } from 'react';

import { AdminCertReadySection } from '@/components/admin/AdminCertReadySection';
import { AdminOperationsBulkBar } from '@/components/admin/AdminOperationsBulkBar';
import { AdminOperationsReviewDialog } from '@/components/admin/AdminOperationsReviewDialog';
import { AdminOperationsTable } from '@/components/admin/AdminOperationsTable';
import { AdminStudentRecordSheet } from '@/components/admin/AdminStudentRecordSheet';
import { FilterBar } from '@/components/ui/filter-bar';
import { MetricCard } from '@/components/ui/metric-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid } from '@/components/layout/content-primitives';
import { adminCopy } from '@/config/copy/admin';
import type { OperationsQueueRow, OperationsStats, StatusFilter } from '@/db/queries/admin-operations';
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

const TAB_CLASSES =
  'relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none';

export default function OperationsPageClient({
  initialQueue,
  initialStats,
}: OperationsPageClientProps) {
  const copy = adminCopy.operations;

  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [reviewTarget, setReviewTarget] = useState<OperationsQueueRow | null>(null);
  const [recordStudentId, setRecordStudentId] = useState<string | null>(null);

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

  const { data: certReadyStudents = [] } = trpc.admin.getCertReadyStudents.useQuery();

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
    setSelectedIds(checked ? new Set(tabFilteredQueue.map((r) => r.id)) : new Set());
  }

  type ReviewStatus = 'approved' | 'rejected' | 'more_info_requested';

  function handleBulkAction(status: ReviewStatus) {
    bulkMutation.mutate({ documentIds: Array.from(selectedIds), status });
  }

  function handleReviewDecision(status: ReviewStatus, reason?: string) {
    if (!reviewTarget) return;
    reviewMutation.mutate({ documentId: reviewTarget.id, status, reason });
  }

  // Client-side tab filter: Active = pending/more_info, Resolved = approved/rejected
  const tabFilteredQueue = useMemo(() => {
    if (activeStatus !== 'all') return queue;
    if (activeTab === 'active') {
      return queue.filter(
        (item) => item.status === 'pending' || item.status === 'more_info_requested',
      );
    }
    return queue.filter(
      (item) => item.status === 'approved' || item.status === 'rejected',
    );
  }, [queue, activeTab, activeStatus]);

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

  function handleCertIssued() {
    void utils.admin.getCertReadyStudents.invalidate();
    void utils.admin.getOperationsStats.invalidate();
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <Grid cols={{ sm: 2, lg: 4 }} gap="md">
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
      </Grid>

      {/* Cert-ready students */}
      <AdminCertReadySection students={certReadyStudents} onIssued={handleCertIssued} />

      {/* Active / Resolved tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as 'active' | 'resolved');
          setActiveStatus('all');
          setSelectedIds(new Set());
        }}
      >
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger value="active" className={TAB_CLASSES}>
            {copy.tabs?.active ?? 'Active'}
          </TabsTrigger>
          <TabsTrigger value="resolved" className={TAB_CLASSES}>
            {copy.tabs?.resolved ?? 'Resolved'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 outline-none space-y-4">
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
            rows={queueLoading ? [] : tabFilteredQueue}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onReview={setReviewTarget}
            onViewRecord={setRecordStudentId}
            emptyLabel={queueLoading ? undefined : copy.empty.description}
          />
        </TabsContent>
      </Tabs>

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

      {/* Student record drawer */}
      <AdminStudentRecordSheet
        studentId={recordStudentId}
        onClose={() => setRecordStudentId(null)}
      />
    </div>
  );
}
