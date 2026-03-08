'use client';

import { useState, useCallback } from 'react';
import {
  CaretLeft,
  CaretRight,
  CheckCircle,
  Clock,
  EnvelopeSimple,
  Funnel,
  MagnifyingGlass,
  Tray,
  XCircle,
} from '@/components/icons';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/empty-state';
import { PageShell, Section, Stack, Grid } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { cn } from '@/lib/utils';
import { adminCopy } from '@/config/copy/admin';
import { trpc } from '@/trpc/client';

type OperationsQueueRow = {
  id: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested' | 'expired';
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  studentId: string;
  studentEmail: string;
  reviewerEmail: string | null;
  schoolName: string | null;
  kycStatus: string | null;
  bankStatus: string | null;
  allDocsApproved: boolean;
};

type OperationsStats = {
  pending: number;
  approved: number;
  rejected: number;
  moreInfoRequested: number;
  expired: number;
  approvedToday: number;
  rejectedToday: number;
};

type Props = {
  initialQueue: OperationsQueueRow[];
  initialStats: OperationsStats;
};

const PAGE_SIZE = 50;

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'more_info_requested' | 'expired';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: adminCopy.operations.filters.all },
  { value: 'pending', label: adminCopy.operations.filters.pending },
  { value: 'approved', label: adminCopy.operations.filters.approved },
  { value: 'rejected', label: adminCopy.operations.filters.rejected },
  { value: 'more_info_requested', label: adminCopy.operations.filters.moreInfoRequested },
  { value: 'expired', label: adminCopy.operations.filters.expired },
];

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
  more_info_requested: 'bg-muted text-muted-foreground',
  expired: 'bg-muted text-muted-foreground',
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  passport: 'Passport',
  bank_statement: 'Bank statement',
  offer_letter: 'Offer letter',
  affidavit: 'Affidavit',
  cac: 'CAC document',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function AdminQueuePageClient({ initialQueue, initialStats }: Props) {
  const copy = adminCopy.operations;
  const breadcrumbs = useDashboardBreadcrumbs(adminCopy.queue.title);
  const utils = trpc.useUtils();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Review dialog state
  const [reviewDocId, setReviewDocId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | 'more_info_requested'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Bulk dialog state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approved' | 'rejected' | 'more_info_requested'>('approved');
  const [bulkNotes, setBulkNotes] = useState('');

  const { data: statsData } = trpc.admin.getOperationsStats.useQuery(undefined, {
    initialData: initialStats,
  });
  const stats = statsData ?? initialStats;

  const { data: queueData, isLoading } = trpc.admin.getOperationsQueue.useQuery(
    {
      status: statusFilter,
      search: search || undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    },
    {
      initialData: page === 0 && statusFilter === 'all' && !search ? initialQueue : undefined,
    },
  );
  const queue = queueData ?? [];

  const reviewMutation = trpc.admin.reviewDocument.useMutation({
    onSuccess: () => {
      void utils.admin.getOperationsQueue.invalidate();
      void utils.admin.getOperationsStats.invalidate();
    },
  });

  const bulkMutation = trpc.admin.bulkReviewDocuments.useMutation({
    onSuccess: () => {
      void utils.admin.getOperationsQueue.invalidate();
      void utils.admin.getOperationsStats.invalidate();
      setSelectedIds(new Set());
    },
  });

  const isBusy = reviewMutation.isPending || bulkMutation.isPending;

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === queue.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(queue.map((d) => d.id)));
    }
  }, [queue, selectedIds.size]);

  const openReviewDialog = (docId: string, action: 'approved' | 'rejected' | 'more_info_requested') => {
    setReviewDocId(docId);
    setReviewAction(action);
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const handleReviewConfirm = async () => {
    if (!reviewDocId) return;
    try {
      await reviewMutation.mutateAsync({
        documentId: reviewDocId,
        status: reviewAction,
        reason: reviewNotes.trim() || undefined,
      });
      toast.success(copy.statusLabels[reviewAction === 'more_info_requested' ? 'moreInfoRequested' : reviewAction]);
      setReviewDialogOpen(false);
    } catch {
      toast.error('Failed to review document.');
    }
  };

  const openBulkDialog = (action: 'approved' | 'rejected' | 'more_info_requested') => {
    setBulkAction(action);
    setBulkNotes('');
    setBulkDialogOpen(true);
  };

  const handleBulkConfirm = async () => {
    if (selectedIds.size === 0) return;
    try {
      await bulkMutation.mutateAsync({
        documentIds: [...selectedIds],
        status: bulkAction,
        reason: bulkNotes.trim() || undefined,
      });
      toast.success(`${selectedIds.size} documents updated.`);
      setBulkDialogOpen(false);
    } catch {
      toast.error('Bulk action failed.');
    }
  };

  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="lg">
          <PageHeader
            title={adminCopy.queue.title}
            subtitle={adminCopy.queue.subtitle}
            breadcrumbs={breadcrumbs}
          />

          {/* Stats bar */}
          <Grid cols={4} gap="sm">
            <StatCard label={copy.stats.pending} value={stats.pending} />
            <StatCard label={copy.stats.approvedToday} value={stats.approvedToday} />
            <StatCard label={copy.stats.rejectedToday} value={stats.rejectedToday} />
            <StatCard label={copy.stats.moreInfo} value={stats.moreInfoRequested} />
          </Grid>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="relative flex-1">
              <MagnifyingGlass
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                weight="duotone"
                aria-hidden="true"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder={copy.filters.searchPlaceholder}
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => { setStatusFilter(f.value); setPage(0); }}
                  className={cn(
                    'inline-flex h-8 items-center rounded-full px-3 text-xs font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    statusFilter === f.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <span className="text-sm font-medium text-foreground">
                {selectedIds.size} selected
              </span>
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => openBulkDialog('approved')}
                  disabled={isBusy}
                >
                  <CheckCircle className="size-3" weight="duotone" aria-hidden="true" />
                  {copy.bulkBar.approve}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                  onClick={() => openBulkDialog('rejected')}
                  disabled={isBusy}
                >
                  <XCircle className="size-3" weight="duotone" aria-hidden="true" />
                  {copy.bulkBar.reject}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={() => setSelectedIds(new Set())}
                >
                  {copy.bulkBar.clearSelection}
                </Button>
              </div>
            </div>
          ) : null}

          {/* Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Clock className="size-6 animate-pulse text-muted-foreground" weight="duotone" aria-hidden="true" />
            </div>
          ) : queue.length === 0 ? (
            <EmptyState
              heading={copy.empty.title}
              body={copy.empty.description}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === queue.length && queue.length > 0}
                          onChange={toggleSelectAll}
                          className="size-4 rounded border-input"
                          aria-label="Select all"
                        />
                      </th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {copy.table.student}
                      </th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {copy.table.documentType}
                      </th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {copy.table.university}
                      </th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {copy.table.submitted}
                      </th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {copy.table.action}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {queue.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(doc.id)}
                            onChange={() => toggleSelect(doc.id)}
                            className="size-4 rounded border-input"
                            aria-label={`Select ${doc.studentEmail}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <EnvelopeSimple className="size-4 shrink-0 text-muted-foreground" weight="duotone" aria-hidden="true" />
                            <span className="text-foreground">{doc.studentEmail}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {doc.schoolName ?? '\u2014'}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(doc.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {doc.status === 'pending' ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs"
                                  onClick={() => openReviewDialog(doc.id, 'approved')}
                                  disabled={isBusy}
                                >
                                  <CheckCircle className="size-3" weight="duotone" aria-hidden="true" />
                                  {copy.actions.approve}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                                  onClick={() => openReviewDialog(doc.id, 'rejected')}
                                  disabled={isBusy}
                                >
                                  <XCircle className="size-3" weight="duotone" aria-hidden="true" />
                                  {copy.actions.reject}
                                </Button>
                              </>
                            ) : (
                              <span className={cn(
                                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                STATUS_BADGE_CLASS[doc.status] ?? 'bg-muted text-muted-foreground',
                              )}>
                                {copy.statusLabels[doc.status === 'more_info_requested' ? 'moreInfoRequested' : doc.status] ?? doc.status}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul role="list" className="space-y-3 md:hidden">
                {queue.map((doc) => (
                  <li key={doc.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(doc.id)}
                          onChange={() => toggleSelect(doc.id)}
                          className="size-4 rounded border-input"
                          aria-label={`Select ${doc.studentEmail}`}
                        />
                        <p className="text-sm font-medium text-foreground">{doc.studentEmail}</p>
                      </div>
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        STATUS_BADGE_CLASS[doc.status] ?? 'bg-muted text-muted-foreground',
                      )}>
                        {copy.statusLabels[doc.status === 'more_info_requested' ? 'moreInfoRequested' : doc.status] ?? doc.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}</span>
                      <span>{doc.schoolName ?? '\u2014'}</span>
                      <span>{formatDate(doc.createdAt)}</span>
                    </div>
                    {doc.status === 'pending' ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 flex-1 gap-1.5 text-xs"
                          onClick={() => openReviewDialog(doc.id, 'approved')}
                          disabled={isBusy}
                        >
                          <CheckCircle className="size-3" weight="duotone" aria-hidden="true" />
                          {copy.actions.approve}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 flex-1 gap-1.5 text-xs text-destructive hover:text-destructive"
                          onClick={() => openReviewDialog(doc.id, 'rejected')}
                          disabled={isBusy}
                        >
                          <XCircle className="size-3" weight="duotone" aria-hidden="true" />
                          {copy.actions.reject}
                        </Button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {queue.length} results
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-input px-3 text-xs font-medium text-foreground disabled:opacity-40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <CaretLeft className="size-4" weight="duotone" aria-hidden="true" />
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={queue.length < PAGE_SIZE}
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-input px-3 text-xs font-medium text-foreground disabled:opacity-40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Next
                    <CaretRight className="size-4" weight="duotone" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </>
          )}
        </Stack>
      </Section>

      {/* Single review dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{copy.reviewDialog.title}</DialogTitle>
            <DialogDescription>
              {copy.reviewDialog.notesPlaceholder}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label htmlFor="review-notes" className="text-sm font-medium text-foreground">
              {copy.reviewDialog.notesLabel}
            </label>
            <Textarea
              id="review-notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder={copy.reviewDialog.notesPlaceholder}
              rows={3}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={reviewMutation.isPending}
            >
              {copy.reviewDialog.cancel}
            </Button>
            <Button
              variant={reviewAction === 'approved' ? 'default' : 'destructive'}
              onClick={() => void handleReviewConfirm()}
              disabled={reviewMutation.isPending}
            >
              {reviewAction === 'approved'
                ? copy.reviewDialog.approveCta
                : reviewAction === 'rejected'
                  ? copy.reviewDialog.rejectCta
                  : copy.reviewDialog.requestInfoCta}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk action dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bulkAction === 'approved'
                ? copy.bulkBar.approve
                : bulkAction === 'rejected'
                  ? copy.bulkBar.reject
                  : copy.bulkBar.requestInfo}
            </DialogTitle>
            <DialogDescription>
              {`This action will apply to ${selectedIds.size} selected documents.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label htmlFor="bulk-notes" className="text-sm font-medium text-foreground">
              {copy.reviewDialog.notesLabel}
            </label>
            <Textarea
              id="bulk-notes"
              value={bulkNotes}
              onChange={(e) => setBulkNotes(e.target.value)}
              placeholder={copy.reviewDialog.notesPlaceholder}
              rows={3}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setBulkDialogOpen(false)}
              disabled={bulkMutation.isPending}
            >
              {copy.reviewDialog.cancel}
            </Button>
            <Button
              variant={bulkAction === 'approved' ? 'default' : 'destructive'}
              onClick={() => void handleBulkConfirm()}
              disabled={bulkMutation.isPending}
            >
              {bulkAction === 'approved'
                ? copy.bulkBar.approve
                : bulkAction === 'rejected'
                  ? copy.bulkBar.reject
                  : copy.bulkBar.requestInfo}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
