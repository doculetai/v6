'use client';

import { useEffect, useState } from 'react';
import {
  ArrowsOut,
  CheckCircle,
  CircleNotch,
  DownloadSimple,
  File,
  Warning,
  XCircle,
} from '@/components/icons';

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
import { uiPrimitives } from '@/config/copy/primitives/ui';
import { trpc } from '@/trpc/client';

const previewCopy = uiPrimitives.documentPreview;

type ReviewAction = 'approved' | 'rejected' | 'more_info_requested';

type DocumentPreviewModalProps = {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Document type label to show in header */
  documentTypeLabel?: string;
  /** Student email to show in header */
  studentEmail?: string;
  /** Show review actions (approve/reject). Pass null to hide. */
  reviewActions?: {
    onReview: (action: ReviewAction, reason?: string) => Promise<void>;
    isPending: boolean;
    copy: {
      approveCta: string;
      rejectCta: string;
      requestInfoCta: string;
      notesLabel: string;
      notesPlaceholder: string;
      cancel: string;
    };
  } | null;
};

function getFileType(url: string): 'pdf' | 'image' | 'unknown' {
  const lower = url.toLowerCase();
  if (lower.includes('.pdf') || lower.includes('application/pdf')) return 'pdf';
  if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.webp')) return 'image';
  // Signed URLs may not have extensions, try to detect from content-type params
  if (lower.includes('image/')) return 'image';
  return 'unknown';
}

export function DocumentPreviewModal({
  documentId,
  open,
  onOpenChange,
  documentTypeLabel,
  studentEmail,
  reviewActions,
}: DocumentPreviewModalProps) {
  const [reviewMode, setReviewMode] = useState<ReviewAction | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const signedUrlMutation = trpc.documents.getDocumentSignedUrl.useMutation();

  useEffect(() => {
    if (open && !signedUrlMutation.data && !signedUrlMutation.isPending) {
      signedUrlMutation.mutate({ documentId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, documentId]);

  const urlData = signedUrlMutation.data;
  const isLoading = open && signedUrlMutation.isPending;
  const isError = signedUrlMutation.isError;

  const fileType = urlData?.url ? getFileType(urlData.url) : 'unknown';

  const handleReviewSubmit = async () => {
    if (!reviewMode || !reviewActions) return;
    await reviewActions.onReview(reviewMode, reviewNotes.trim() || undefined);
    setReviewMode(null);
    setReviewNotes('');
    onOpenChange(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReviewMode(null);
      setReviewNotes('');
      signedUrlMutation.reset();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <File className="size-5" weight="duotone" aria-hidden="true" />
            {documentTypeLabel ?? previewCopy.defaultTitle}
          </DialogTitle>
          {studentEmail ? (
            <DialogDescription>{studentEmail}</DialogDescription>
          ) : null}
        </DialogHeader>

        {/* Preview area */}
        <div className="relative min-h-[400px] flex-1 overflow-auto rounded-lg border border-border bg-muted/30">
          {isLoading ? (
            <div className="flex h-full items-center justify-center py-20">
              <CircleNotch className="size-8 animate-spin text-muted-foreground" weight="duotone" aria-hidden="true" />
            </div>
          ) : isError ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-20">
              <Warning className="size-8 text-destructive" weight="duotone" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">{previewCopy.loadError}</p>
              <Button
                variant="outline"
                size="sm"
                className="min-h-11 min-w-11"
                onClick={() => signedUrlMutation.mutate({ documentId })}
              >
                {previewCopy.retryCta}
              </Button>
            </div>
          ) : urlData?.url ? (
            <>
              {fileType === 'pdf' ? (
                <iframe
                  src={urlData.url}
                  className="h-full min-h-[400px] w-full"
                  title={documentTypeLabel ?? previewCopy.defaultTitle}
                />
              ) : fileType === 'image' ? (
                <div className="flex items-center justify-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={urlData.url}
                    alt={documentTypeLabel ?? previewCopy.defaultTitle}
                    className="max-h-[60vh] rounded-lg object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-20">
                  <File className="size-8 text-muted-foreground" weight="duotone" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">{previewCopy.unsupportedType}</p>
                  <Button asChild variant="outline" size="sm" className="min-h-11 min-w-11">
                    <a href={urlData.url} target="_blank" rel="noopener noreferrer">
                      <DownloadSimple className="mr-1.5 size-4" weight="duotone" aria-hidden="true" />
                      {previewCopy.downloadCta}
                    </a>
                  </Button>
                </div>
              )}

              {/* Download + fullscreen actions */}
              <div className="absolute right-3 top-3 flex gap-1.5">
                <Button asChild variant="secondary" size="sm" className="min-h-11 min-w-11 gap-1.5">
                  <a href={urlData.url} target="_blank" rel="noopener noreferrer" aria-label={previewCopy.openNewTabAriaLabel}>
                    <ArrowsOut className="size-3.5" weight="duotone" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </>
          ) : null}
        </div>

        {/* Review notes area (when in review mode) */}
        {reviewMode && reviewActions ? (
          <div className="space-y-3 border-t border-border pt-3">
            <label htmlFor="preview-review-notes" className="text-sm font-medium text-foreground">
              {reviewActions.copy.notesLabel}
            </label>
            <Textarea
              id="preview-review-notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder={reviewActions.copy.notesPlaceholder}
              rows={2}
              className="resize-none"
            />
          </div>
        ) : null}

        {/* Footer actions */}
        {reviewActions ? (
          <DialogFooter className="gap-2 sm:gap-0">
            {reviewMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setReviewMode(null)}
                  disabled={reviewActions.isPending}
                >
                  {reviewActions.copy.cancel}
                </Button>
                <Button
                  variant={reviewMode === 'approved' ? 'default' : 'destructive'}
                  onClick={() => void handleReviewSubmit()}
                  disabled={reviewActions.isPending}
                >
                  {reviewMode === 'approved'
                    ? reviewActions.copy.approveCta
                    : reviewMode === 'rejected'
                      ? reviewActions.copy.rejectCta
                      : reviewActions.copy.requestInfoCta}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setReviewMode('approved')}
                >
                  <CheckCircle className="size-3.5" weight="duotone" aria-hidden="true" />
                  {reviewActions.copy.approveCta}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => setReviewMode('rejected')}
                >
                  <XCircle className="size-3.5" weight="duotone" aria-hidden="true" />
                  {reviewActions.copy.rejectCta}
                </Button>
              </>
            )}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
