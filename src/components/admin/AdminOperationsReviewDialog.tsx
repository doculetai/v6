'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import { adminCopy } from '@/config/copy/admin';
import type { OperationsQueueRow } from '@/db/queries/admin-operations';
import { cn, formatDocumentType } from '@/lib/utils';

type ReviewStatus = 'approved' | 'rejected' | 'more_info_requested';

interface AdminOperationsReviewDialogProps {
  row: OperationsQueueRow | null;
  isOpen: boolean;
  onClose: () => void;
  onDecision: (status: ReviewStatus, reason?: string) => void;
  isLoading?: boolean;
  isLockedByOther?: boolean;
}

export function AdminOperationsReviewDialog({
  row,
  isOpen,
  onClose,
  onDecision,
  isLoading = false,
  isLockedByOther = false,
}: AdminOperationsReviewDialogProps) {
  const [notes, setNotes] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const copy = adminCopy.operations.reviewDialog;
  const maxChars = adminCopy.rejectionMaxChars;

  function handleDecision(status: ReviewStatus) {
    if (status === 'rejected' && !notes.trim()) {
      setRejectError(adminCopy.rejectionRequired);
      return;
    }
    setRejectError(null);
    onDecision(status, notes.trim() || undefined);
    setNotes('');
  }

  function handleClose() {
    setNotes('');
    setRejectError(null);
    onClose();
  }

  function applyTemplate(template: string) {
    setNotes(template);
    setRejectError(null);
  }

  if (!row) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-foreground">
            {copy.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isLockedByOther && (
            <Callout variant="warning">
              {adminCopy.itemLock.actionsDisabled}
            </Callout>
          )}

          <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/40 p-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
                {copy.studentLabel}
              </p>
              <p className="mt-0.5 truncate font-medium text-foreground dark:text-foreground">
                {row.studentEmail}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
                {copy.documentTypeLabel}
              </p>
              <p className="mt-0.5 text-foreground dark:text-foreground">
                {formatDocumentType(row.type)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
                {copy.universityLabel}
              </p>
              <p className="mt-0.5 text-foreground dark:text-foreground">
                {row.schoolName ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
                {copy.submittedLabel}
              </p>
              <p className="mt-0.5 text-foreground dark:text-foreground">
                <TimestampLabel value={row.createdAt} mode="both" />
              </p>
            </div>
          </div>

          {/* Rejection template chips */}
          <div className="flex flex-wrap gap-2">
            {adminCopy.rejectionTemplates.map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => applyTemplate(template)}
                disabled={isLoading || isLockedByOther}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
              >
                {template}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="review-notes"
              className="text-sm font-medium text-foreground dark:text-foreground"
            >
              {copy.notesLabel}
            </Label>
            <textarea
              id="review-notes"
              value={notes}
              onChange={(e) => {
                if (e.target.value.length <= maxChars) {
                  setNotes(e.target.value);
                  if (rejectError) setRejectError(null);
                }
              }}
              placeholder={copy.notesPlaceholder}
              rows={3}
              disabled={isLoading || isLockedByOther}
              aria-invalid={rejectError != null}
              className={cn(
                'w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 dark:bg-background dark:text-foreground',
                rejectError ? 'border-destructive' : 'border-border',
              )}
            />
            <div className="flex items-center justify-between">
              {rejectError ? (
                <p className="text-xs text-destructive">{rejectError}</p>
              ) : (
                <span />
              )}
              <span
                className={cn(
                  'text-xs',
                  notes.length >= 280 ? 'text-amber-600' : 'text-muted-foreground',
                )}
              >
                {notes.length}/{maxChars}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="min-h-11"
          >
            {copy.cancel}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDecision('more_info_requested')}
            disabled={isLoading || isLockedByOther}
            className="min-h-11"
          >
            {copy.requestInfoCta}
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDecision('rejected')}
            disabled={isLoading || isLockedByOther}
            className="min-h-11"
          >
            {copy.rejectCta}
          </Button>
          <Button
            onClick={() => handleDecision('approved')}
            disabled={isLoading || isLockedByOther}
            className="min-h-11"
          >
            {copy.approveCta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
