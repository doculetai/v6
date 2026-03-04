'use client';

import { ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import { cn } from '@/lib/utils';
import { universityCopy } from '@/config/copy/university';
import { trpc } from '@/trpc/client';

import type { DocumentRow } from './document-row-types';

type ReviewAction = 'approved' | 'rejected' | 'more_info_requested';

const reviewSchema = z.object({ notes: z.string() });
type ReviewFormValues = z.infer<typeof reviewSchema>;

interface UniversityDocumentReviewDialogProps {
  document: DocumentRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UniversityDocumentReviewDialog({
  document,
  open,
  onOpenChange,
}: UniversityDocumentReviewDialogProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);

  const copy = universityCopy.documents;

  const {
    register,
    getValues,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { notes: '' },
  });

  const mutation = trpc.university.reviewDocument.useMutation({
    onSuccess: () => {
      reset();
      setPendingAction(null);
      onOpenChange(false);
      router.refresh();
    },
    onError: () => {
      setPendingAction(null);
    },
  });

  function handleAction(action: ReviewAction) {
    const notes = getValues('notes');

    if (action === 'rejected' && !notes.trim()) {
      setError('notes', {
        message: copy.review.rejectionReasonRequired,
      });
      return;
    }

    clearErrors();

    if (!document) return;
    setPendingAction(action);
    mutation.mutate({
      documentId: document.id,
      action,
      notes: notes.trim() || undefined,
    });
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setPendingAction(null);
    }
    onOpenChange(nextOpen);
  }

  if (!document) return null;

  const typeLabel =
    copy.typeLabels[document.type as keyof typeof copy.typeLabels] ?? document.type;
  const isRejecting = pendingAction === 'rejected';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{copy.review.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document meta */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <dt className="text-muted-foreground">{copy.review.student}</dt>
            <dd className="truncate text-foreground">{document.studentEmail}</dd>

            <dt className="text-muted-foreground">{copy.review.type}</dt>
            <dd className="text-foreground">{typeLabel}</dd>

            <dt className="text-muted-foreground">{copy.review.submitted}</dt>
            <dd className="text-foreground">
              <TimestampLabel value={document.createdAt} mode="both" />
            </dd>
          </dl>

          {/* PDF preview link */}
          <a
            href={document.storageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-ring"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            {copy.review.previewLink}
          </a>

          {/* Notes field — label adapts when reject is active */}
          <div className="space-y-1.5">
            <Label htmlFor="review-notes">
              {isRejecting ? copy.review.rejectionReasonLabel : copy.review.notesLabel}
            </Label>
            <textarea
              id="review-notes"
              {...register('notes')}
              placeholder={
                isRejecting
                  ? copy.review.rejectionReasonPlaceholder
                  : copy.review.notesPlaceholder
              }
              rows={3}
              className={cn(
                'w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            />
            {errors.notes ? (
              <p className="text-xs text-destructive" role="alert">
                {errors.notes.message}
              </p>
            ) : null}
            {mutation.error ? (
              <p className="text-xs text-destructive" role="alert">
                {universityCopy.errors.generic}
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={mutation.isPending}
          >
            {copy.actions.cancel}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleAction('more_info_requested')}
            disabled={mutation.isPending}
            aria-busy={pendingAction === 'more_info_requested' && mutation.isPending}
          >
            {copy.actions.requestInfo}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={() => handleAction('rejected')}
            disabled={mutation.isPending}
            aria-busy={pendingAction === 'rejected' && mutation.isPending}
          >
            {copy.actions.reject}
          </Button>

          <Button
            type="button"
            onClick={() => handleAction('approved')}
            disabled={mutation.isPending}
            aria-busy={pendingAction === 'approved' && mutation.isPending}
          >
            {copy.actions.approve}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
