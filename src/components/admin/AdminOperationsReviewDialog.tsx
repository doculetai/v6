'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
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
import type { DocumentStatus, OperationsQueueRow } from '@/db/queries/admin-operations';
import { formatDocumentType } from '@/lib/utils';

interface AdminOperationsReviewDialogProps {
  row: OperationsQueueRow | null;
  isOpen: boolean;
  onClose: () => void;
  onDecision: (status: DocumentStatus, reason?: string) => void;
  isLoading?: boolean;
}

export function AdminOperationsReviewDialog({
  row,
  isOpen,
  onClose,
  onDecision,
  isLoading = false,
}: AdminOperationsReviewDialogProps) {
  const [notes, setNotes] = useState('');
  const copy = adminCopy.operations.reviewDialog;

  function handleDecision(status: DocumentStatus) {
    onDecision(status, notes.trim() || undefined);
    setNotes('');
  }

  function handleClose() {
    setNotes('');
    onClose();
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
              onChange={(e) => setNotes(e.target.value)}
              placeholder={copy.notesPlaceholder}
              rows={3}
              disabled={isLoading}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 dark:bg-background dark:text-foreground"
            />
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
            disabled={isLoading}
            className="min-h-11"
          >
            {copy.requestInfoCta}
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDecision('rejected')}
            disabled={isLoading}
            className="min-h-11"
          >
            {copy.rejectCta}
          </Button>
          <Button
            onClick={() => handleDecision('approved')}
            disabled={isLoading}
            className="min-h-11"
          >
            {copy.approveCta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
