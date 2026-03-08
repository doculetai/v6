'use client';

import { useEffect, useState } from 'react';

import { AdminCertReadySection } from '@/components/admin/AdminCertReadySection';
import { AdminOperationsBulkBar } from '@/components/admin/AdminOperationsBulkBar';
import { AdminOperationsReviewDialog } from '@/components/admin/AdminOperationsReviewDialog';
import { AdminOperationsTable } from '@/components/admin/AdminOperationsTable';
import { AdminStudentRecordSheet } from '@/components/admin/AdminStudentRecordSheet';
import { FilterBar } from '@/components/ui/filter-bar';
import { MetricCard } from '@/components/ui/metric-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, Stack } from '@/components/layout/content-primitives';
import { cn } from '@/lib/utils';
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

type CategoryFilter = 'all' | 'documents' | 'banking' | 'cert_ready';

const CATEGORY_FILTER_CHIPS: Array<{ key: CategoryFilter; labelKey: keyof typeof adminCopy.categoryFilters }> = [
  { key: 'all', labelKey: 'all' },
  { key: 'documents', labelKey: 'documents' },
  { key: 'banking', labelKey: 'banking' },
  { key: 'cert_ready', labelKey: 'cert_ready' },
];

/** Map document types to categories */
function getDocCategory(type: string): CategoryFilter {
  if (type === 'bank_statement' || type === 'balance_verification') return 'banking';
  return 'documents';
}

const TAB_CLASSES =
  'relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none';

export default function OperationsPageClient({
  initialQueue,
  initialStats,
}: OperationsPageClientProps) {
  const copy = adminCopy.operations;

  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
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
    setSelectedIds(checked ? new Set(sortedQueue.map((r) => r.id)) : new Set());
  }

  type ReviewStatus = 'approved' | 'rejected' | 'more_info_requested';

  function handleBulkAction(status: ReviewStatus) {
    bulkMutation.mutate({ documentIds: Array.from(selectedIds), status });
  }

  function handleReviewDecision(status: ReviewStatus, reason?: string) {
    if (!reviewTarget) return;
    reviewMutation.mutate({ documentId: reviewTarget.id, status, reason });
  }

  // Client-side tab + category filter: Active = pending/more_info, Resolved = approved/rejected
  let tabFilteredQueue = queue;

  // Apply tab filter when status is 'all'
  if (activeStatus === 'all') {
    if (activeTab === 'active') {
      tabFilteredQueue = tabFilteredQueue.filter(
        (item) => item.status === 'pending' || item.status === 'more_info_requested',
      );
    } else {
      tabFilteredQueue = tabFilteredQueue.filter(
        (item) => item.status === 'approved' || item.status === 'rejected',
      );
    }
  }

  // Apply category filter
  if (activeCategory !== 'all') {
    tabFilteredQueue = tabFilteredQueue.filter((item) => getDocCategory(item.type) === activeCategory);
  }

  // Sort escalated items to the top
  const sortedQueue = [
    ...tabFilteredQueue.filter((i) => i.isEscalated),
    ...tabFilteredQueue.filter((i) => !i.isEscalated),
  ];

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
          <Stack gap="sm">
            {/* Status filter bar */}
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

            {/* Category filter chips */}
            <div className="flex flex-wrap gap-2">
              {CATEGORY_FILTER_CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => {
                    setActiveCategory(chip.key);
                    setSelectedIds(new Set());
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    activeCategory === chip.key
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-accent',
                  )}
                >
                  {adminCopy.categoryFilters[chip.labelKey]}
                </button>
              ))}
            </div>
          </Stack>

          {/* Table */}
          <AdminOperationsTable
            rows={queueLoading ? [] : sortedQueue}
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
