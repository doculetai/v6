import { useState } from 'react';

import { Seal } from '@phosphor-icons/react';
import { FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/status-badge';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import { adminCopy } from '@/config/copy/admin';
import { cn, formatDocumentType } from '@/lib/utils';
import type { DocumentStatus, OperationsQueueRow } from '@/db/queries/admin-operations';

type BadgeStatus = 'pending' | 'verified' | 'rejected' | 'attention' | 'expired';

const statusToBadge: Record<DocumentStatus, BadgeStatus> = {
  pending: 'pending',
  approved: 'verified',
  rejected: 'rejected',
  more_info_requested: 'attention',
  expired: 'expired',
};

function deriveTier(kycStatus: string | null, bankStatus: string | null): string {
  if (!kycStatus || kycStatus === 'not_started' || kycStatus === 'failed') {
    return adminCopy.operations.tierLabels.unverified;
  }
  if (kycStatus === 'verified' && bankStatus === 'verified') {
    return adminCopy.operations.tierLabels.tier2;
  }
  if (kycStatus === 'verified') {
    return adminCopy.operations.tierLabels.tier1;
  }
  return adminCopy.operations.tierLabels.unverified;
}

function isCertReady(row: OperationsQueueRow): boolean {
  return row.allDocsApproved && row.kycStatus === 'verified';
}

interface IssueCertConfirmDialogProps {
  studentEmail: string;
  open: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function IssueCertConfirmDialog({
  studentEmail,
  open,
  isLoading,
  onConfirm,
  onClose,
}: IssueCertConfirmDialogProps) {
  const copy = adminCopy.certReady;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-foreground">
            {copy.confirmTitle}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
          {copy.confirmDescription(studentEmail)}
        </p>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="min-h-11">
            {copy.cancel}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} className="min-h-11">
            {copy.confirmCta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AdminOperationsTableProps {
  rows: OperationsQueueRow[];
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onReview: (row: OperationsQueueRow) => void;
  onStudentClick: (studentId: string) => void;
  onIssueCertificate: (studentId: string) => void;
  isIssuingCert?: boolean;
  emptyLabel?: string;
}

export function AdminOperationsTable({
  rows,
  selectedIds,
  onSelect,
  onSelectAll,
  onReview,
  onStudentClick,
  onIssueCertificate,
  isIssuingCert = false,
  emptyLabel,
}: AdminOperationsTableProps) {
  const copy = adminCopy.operations;
  const certCopy = adminCopy.certReady;
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someSelected = rows.some((r) => selectedIds.has(r.id));

  const [confirmTarget, setConfirmTarget] = useState<OperationsQueueRow | null>(null);

  function handleIssueCertClick(row: OperationsQueueRow, e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmTarget(row);
  }

  function handleConfirmIssue() {
    if (!confirmTarget) return;
    onIssueCertificate(confirmTarget.studentId);
    setConfirmTarget(null);
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <FileText className="mx-auto mb-3 size-10 text-muted-foreground" />
        <p className="font-medium text-foreground dark:text-foreground">
          {copy.empty.title}
        </p>
        <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
          {emptyLabel ?? copy.empty.description}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    aria-label="Select all"
                    className="size-4 cursor-pointer accent-primary"
                  />
                </th>
                <th className="px-4 py-3 font-medium">{copy.table.student}</th>
                <th className="px-4 py-3 font-medium">{copy.table.documentType}</th>
                <th className="px-4 py-3 font-medium">{copy.table.university}</th>
                <th className="px-4 py-3 font-medium">{copy.table.tier}</th>
                <th className="px-4 py-3 font-medium">{copy.table.submitted}</th>
                <th className="px-4 py-3 font-medium">{copy.table.reviewer}</th>
                <th className="px-4 py-3 font-medium">{copy.table.action}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isSelected = selectedIds.has(row.id);
                const certReady = isCertReady(row);
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-t border-border/60 transition-colors',
                      isSelected && 'bg-primary/5 dark:bg-primary/10',
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelect(row.id, e.target.checked)}
                        aria-label={`Select ${row.studentEmail}`}
                        className="size-4 cursor-pointer accent-primary"
                      />
                    </td>
                    <td className="max-w-44 truncate px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onStudentClick(row.studentId)}
                        className="truncate font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-foreground"
                      >
                        {row.studentEmail}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground dark:text-muted-foreground">
                      {formatDocumentType(row.type)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground dark:text-muted-foreground">
                      {row.schoolName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground dark:text-muted-foreground">
                      {deriveTier(row.kycStatus, row.bankStatus)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground dark:text-muted-foreground">
                      <TimestampLabel value={row.createdAt} mode="relative" />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground dark:text-muted-foreground">
                      {row.reviewerEmail ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={statusToBadge[row.status]} size="sm" />
                        {certReady && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                            <Seal size={12} weight="duotone" aria-hidden="true" />
                            {certCopy.badge}
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReview(row)}
                          className="min-h-11 text-xs"
                        >
                          {copy.actions.review}
                        </Button>
                        {certReady && (
                          <Button
                            size="sm"
                            onClick={(e) => handleIssueCertClick(row, e)}
                            disabled={isIssuingCert}
                            className="min-h-11 text-xs"
                          >
                            {certCopy.issueCta}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="space-y-3 p-3 md:hidden">
          {rows.map((row) => {
            const isSelected = selectedIds.has(row.id);
            const certReady = isCertReady(row);
            return (
              <article
                key={row.id}
                className={cn(
                  'rounded-lg border border-border/60 p-3 transition-colors',
                  isSelected && 'border-primary/30 bg-primary/5 dark:bg-primary/10',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelect(row.id, e.target.checked)}
                      aria-label={`Select ${row.studentEmail}`}
                      className="mt-0.5 size-4 cursor-pointer accent-primary"
                    />
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onStudentClick(row.studentId)}
                        className="truncate text-sm font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-foreground"
                      >
                        {row.studentEmail}
                      </button>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        {formatDocumentType(row.type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={statusToBadge[row.status]} size="sm" />
                    {certReady && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                        <Seal size={12} weight="duotone" aria-hidden="true" />
                        {certCopy.badge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground dark:text-muted-foreground">
                  <span>{row.schoolName ?? '—'}</span>
                  <span>{deriveTier(row.kycStatus, row.bankStatus)}</span>
                  <TimestampLabel value={row.createdAt} mode="relative" />
                  <span>{row.reviewerEmail ?? '—'}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReview(row)}
                    className="min-h-11 flex-1 text-xs"
                  >
                    {copy.actions.review}
                  </Button>
                  {certReady && (
                    <Button
                      size="sm"
                      onClick={(e) => handleIssueCertClick(row, e)}
                      disabled={isIssuingCert}
                      className="min-h-11 flex-1 text-xs"
                    >
                      {certCopy.issueCta}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {confirmTarget && (
        <IssueCertConfirmDialog
          studentEmail={confirmTarget.studentEmail}
          open={Boolean(confirmTarget)}
          isLoading={isIssuingCert}
          onConfirm={handleConfirmIssue}
          onClose={() => setConfirmTarget(null)}
        />
      )}
    </>
  );
}
