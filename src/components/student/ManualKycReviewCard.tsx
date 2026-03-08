'use client';

import { IdentificationCard, UserFocus, CircleNotch, CheckCircle, Warning } from '@/components/icons';
import { useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { studentCopy } from '@/config/copy/student';
import { supabaseBrowserClient } from '@/lib/auth/browser-client';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

type ManualKycReviewCardProps = {
  failedAttempts: number;
  onSuccess: () => void;
};

type UploadState = 'idle' | 'uploading' | 'submitted' | 'error';

const ACCEPTED_TYPES = 'image/jpeg,image/png,application/pdf';
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

async function uploadToStorage(file: File, userId: string, label: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `manual-kyc/${userId}/${label}-${Date.now()}.${ext}`;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_DOCUMENTS_BUCKET ?? 'documents';

  const { error } = await supabaseBrowserClient.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabaseBrowserClient.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function ManualKycReviewCard({ failedAttempts, onSuccess }: ManualKycReviewCardProps) {
  const copy = studentCopy.verify.kycFailure;

  const [governmentIdFile, setGovernmentIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const govIdRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const manualReviewMutation = trpc.student.requestManualKycReview.useMutation({
    onSuccess: () => {
      setUploadState('submitted');
      onSuccess();
    },
    onError: (err: { message: string }) => {
      setUploadState('error');
      setErrorMessage(err.message);
    },
  });

  const handleFileChange = useCallback(
    (setter: typeof setGovernmentIdFile) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_SIZE_BYTES) {
          setErrorMessage(copy.fileTooLarge);
          return;
        }
        setErrorMessage(null);
        setter(file);
      },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!governmentIdFile || !selfieFile) return;

      setUploadState('uploading');
      setErrorMessage(null);

      try {
        // Get user ID for storage path
        const { data: { user } } = await supabaseBrowserClient.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const [govIdUrl, selfieUrl] = await Promise.all([
          uploadToStorage(governmentIdFile, user.id, 'government-id'),
          uploadToStorage(selfieFile, user.id, 'selfie'),
        ]);

        manualReviewMutation.mutate({
          governmentIdStorageUrl: govIdUrl,
          selfieStorageUrl: selfieUrl,
        });
      } catch {
        setUploadState('error');
        setErrorMessage(copy.uploadError);
      }
    },
    [governmentIdFile, selfieFile, manualReviewMutation],
  );

  // Already submitted state
  if (uploadState === 'submitted') {
    return (
      <Card className="border-primary/30 bg-primary/5 dark:bg-primary/10">
        <CardHeader className="space-y-3">
          <div className="inline-flex items-center gap-2 text-primary">
            <CheckCircle className="size-5" weight="duotone" aria-hidden="true" />
            <CardTitle className="text-lg md:text-xl">{copy.submittedTitle}</CardTitle>
          </div>
          <CardDescription>{copy.submittedDescription}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show appropriate guidance based on attempt count
  const guidanceMessage = failedAttempts >= 2 ? copy.secondAttempt : copy.firstAttempt;

  return (
    <Card className="border-border bg-card/95 dark:bg-card/90">
      <CardHeader className="space-y-3">
        <div className="inline-flex items-center gap-2 text-card-foreground">
          <IdentificationCard className="size-5" weight="duotone" aria-hidden="true" />
          <CardTitle className="text-lg md:text-xl">{copy.manualReviewTitle}</CardTitle>
        </div>
        <CardDescription>{copy.manualReviewDescription}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Guidance banner */}
        <div className="rounded-lg border border-border bg-background/80 p-3 dark:bg-background/60">
          <p className="text-sm text-muted-foreground">{guidanceMessage}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Government ID upload */}
          <div className="space-y-2">
            <Label htmlFor="manual-kyc-gov-id">{copy.governmentIdLabel}</Label>
            <button
              type="button"
              onClick={() => govIdRef.current?.click()}
              className={cn(
                'flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                governmentIdFile ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/40',
              )}
            >
              <IdentificationCard
                weight="duotone"
                className={cn('size-6', governmentIdFile ? 'text-primary' : 'text-muted-foreground')}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                {governmentIdFile ? (
                  <p className="truncate text-sm font-medium text-foreground">{governmentIdFile.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">{copy.governmentIdPlaceholder}</p>
                )}
              </div>
            </button>
            <input
              ref={govIdRef}
              id="manual-kyc-gov-id"
              type="file"
              accept={ACCEPTED_TYPES}
              className="sr-only"
              onChange={handleFileChange(setGovernmentIdFile)}
            />
          </div>

          {/* Selfie upload */}
          <div className="space-y-2">
            <Label htmlFor="manual-kyc-selfie">{copy.selfieLabel}</Label>
            <button
              type="button"
              onClick={() => selfieRef.current?.click()}
              className={cn(
                'flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selfieFile ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/40',
              )}
            >
              <UserFocus
                weight="duotone"
                className={cn('size-6', selfieFile ? 'text-primary' : 'text-muted-foreground')}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                {selfieFile ? (
                  <p className="truncate text-sm font-medium text-foreground">{selfieFile.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">{copy.selfiePlaceholder}</p>
                )}
              </div>
            </button>
            <input
              ref={selfieRef}
              id="manual-kyc-selfie"
              type="file"
              accept="image/jpeg,image/png"
              capture="user"
              className="sr-only"
              onChange={handleFileChange(setSelfieFile)}
            />
          </div>

          {errorMessage ? (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
              <Warning className="mt-0.5 size-4 shrink-0 text-destructive" weight="duotone" aria-hidden="true" />
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          ) : null}

          <Button
            type="submit"
            className="min-h-11 w-full"
            disabled={!governmentIdFile || !selfieFile || uploadState === 'uploading'}
          >
            {uploadState === 'uploading' ? (
              <span className="inline-flex items-center gap-2">
                <CircleNotch className="size-4 animate-spin" weight="duotone" aria-hidden="true" />
                {copy.submittingCta}
              </span>
            ) : (
              copy.submitCta
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
