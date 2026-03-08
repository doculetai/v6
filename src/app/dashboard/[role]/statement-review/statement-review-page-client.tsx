'use client';

import { useState } from 'react';

import {
  CaretLeft,
  CaretRight,
  Eye,
  FileText,
} from '@/components/icons';

import { DocumentPreviewModal } from '@/components/shared/DocumentPreviewModal';
import { Stack } from '@/components/layout/content-primitives';
import { adminCopy } from '@/config/copy/admin';
import { trpc } from '@/trpc/client';

type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'more_info_requested' | 'expired';

type StatementRow = {
  id: string;
  type: string;
  status: DocumentStatus;
  createdAt: Date;
  studentEmail: string;
  reviewerEmail: string | null;
};

interface StatementReviewPageClientProps {
  initialRows: StatementRow[] | null;
}

const PAGE_SIZE = 50;

const STATUS_STYLES: Record<DocumentStatus, string> = {
  pending: 'bg-primary/5 text-primary border border-primary/20',
  approved: 'bg-success/10 text-success border border-success/20',
  rejected: 'bg-destructive/10 text-destructive border border-destructive/20',
  more_info_requested: 'bg-warning/10 text-warning border border-warning/20',
  expired: 'bg-muted text-muted-foreground border border-border',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function StatementReviewPageClient({ initialRows }: StatementReviewPageClientProps) {
  const copy = adminCopy.statementReview;
  const [page, setPage] = useState(0);
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const reviewMutation = trpc.admin.reviewDocument.useMutation({
    onSuccess: () => void utils.admin.getOperationsQueue.invalidate(),
  });

  const handleReview = async (action: 'approved' | 'rejected' | 'more_info_requested', reason?: string) => {
    if (!previewDocId) return;
    await reviewMutation.mutateAsync({
      documentId: previewDocId,
      status: action,
      reason,
    });
  };

  const { data: queueData, isLoading, isError } = trpc.admin.getOperationsQueue.useQuery(
    { status: 'all', limit: 100, offset: 0 },
    {
      select: (data) => data.filter((row) => row.type === 'bank_statement'),
    },
  );

  const allRows = initialRows !== null
    ? (queueData ?? initialRows)
    : queueData ?? [];

  const previewRow = allRows.find((r) => r.id === previewDocId);

  if (isError || (!isLoading && initialRows === null && !queueData)) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{copy.error.description}</p>
      </div>
    );
  }

  if (isLoading && initialRows === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const total = allRows.length;
  const from = total > 0 ? page * PAGE_SIZE + 1 : 0;
  const to = Math.min((page + 1) * PAGE_SIZE, total);
  const pageRows = allRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const hasNext = to < total;
  const hasPrev = page > 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-16 text-center">
        <FileText className="size-10 text-primary" weight="duotone" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-foreground">{copy.empty.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.empty.description}</p>
        </div>
      </div>
    );
  }

  return (
    <Stack gap="md">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {copy.table.student}
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {copy.table.uploadDate}
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {copy.table.status}
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {copy.table.action}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows.map((row) => {
              const statusLabel = copy.statusLabels[row.status] ?? row.status;
              const statusStyle = STATUS_STYLES[row.status];
              return (
                <tr key={row.id} className="hover:bg-muted/40">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                    {row.studentEmail}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-input px-3 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`${copy.actions.view} ${row.studentEmail}`}
                      onClick={() => setPreviewDocId(row.id)}
                    >
                      <Eye className="size-4" weight="duotone" aria-hidden="true" />
                      {copy.actions.view}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul role="list" className="space-y-3 md:hidden">
        {pageRows.map((row) => {
          const statusLabel = copy.statusLabels[row.status] ?? row.status;
          const statusStyle = STATUS_STYLES[row.status];
          return (
            <li key={row.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{row.studentEmail}</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle}`}>
                  {statusLabel}
                </span>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                {formatDate(row.createdAt)}
              </p>
              <button
                type="button"
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md border border-input text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${copy.actions.view} ${row.studentEmail}`}
                onClick={() => setPreviewDocId(row.id)}
              >
                <Eye className="size-4" weight="duotone" aria-hidden="true" />
                {copy.actions.view}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {copy.pagination.showing(from, to, total)}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-md border border-input px-3 text-xs font-medium text-foreground disabled:opacity-40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CaretLeft className="size-4" weight="duotone" aria-hidden="true" />
              {copy.pagination.previous}
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-md border border-input px-3 text-xs font-medium text-foreground disabled:opacity-40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copy.pagination.next}
              <CaretRight className="size-4" weight="duotone" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {previewDocId ? (
        <DocumentPreviewModal
          documentId={previewDocId}
          open={Boolean(previewDocId)}
          onOpenChange={(open) => { if (!open) setPreviewDocId(null); }}
          documentTypeLabel={copy.documentTypeLabel}
          studentEmail={previewRow?.studentEmail}
          reviewActions={{
            onReview: handleReview,
            isPending: reviewMutation.isPending,
            copy: copy.reviewActions,
          }}
        />
      ) : null}
    </Stack>
  );
}
