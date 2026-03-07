'use client';

import { useState } from 'react';
import { CheckCircle, FileText, Wallet, Warning, WarningCircle } from '@/components/icons';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrustSignal } from '@/components/ui/trust-signal';
import { uiPrimitives } from '@/config/copy/primitives';
import { studentCopy } from '@/config/copy/student';
import { routes } from '@/config/routes';
import { useMonoConnect } from '@/lib/hooks/useMonoConnect';
import { trpc } from '@/trpc/client';

type BankVerificationSectionProps = {
  isConnected: boolean;
  bankName: string | null;
  accountNumberMasked: string | null;
  onBankConnected: () => void;
  bankStatementStatus?: 'pending' | 'approved' | 'rejected' | 'more_info_requested' | 'expired' | null;
  bankStatementRejectionNote?: string | null;
  onResubmit?: () => void;
};

export function BankVerificationSection({
  isConnected,
  bankName,
  accountNumberMasked,
  onBankConnected,
  bankStatementStatus,
  bankStatementRejectionNote,
  onResubmit,
}: BankVerificationSectionProps) {
  const copy = studentCopy.bankVerification;
  const [error, setError] = useState<string | null>(null);
  const [monoFailed, setMonoFailed] = useState(false);

  const monoPublicKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY ?? '';

  const monoMutation = trpc.student.connectMonoBankAccount.useMutation({
    onSuccess: () => {
      setError(null);
      setMonoFailed(false);
      onBankConnected();
    },
    onError: () => {
      setError(copy.errorConnect);
      setMonoFailed(true);
    },
  });

  const monoConnect = useMonoConnect({
    publicKey: monoPublicKey,
    onSuccess: (code: string) => {
      monoMutation.mutate({ monoAccountId: code });
    },
  });

  const isBusy = monoMutation.isPending || monoConnect.isLoading;

  function handleRetry() {
    setError(null);
    setMonoFailed(false);
    void monoConnect.open();
  }

  return (
    <Card className="border-border bg-card" id="bank">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-card-foreground">
            <Wallet className="size-5" weight="duotone" aria-hidden="true" />
            <CardTitle className="text-lg md:text-xl">{copy.sectionTitle}</CardTitle>
          </div>
          {isConnected ? (
            <Badge variant="default">
              <CheckCircle className="mr-1 size-3" weight="duotone" aria-hidden="true" />
              {copy.status.verified}
            </Badge>
          ) : bankStatementStatus === 'rejected' ? (
            <Badge variant="destructive">{copy.status.rejected}</Badge>
          ) : bankStatementStatus === 'pending' ? (
            <Badge variant="secondary">{copy.status.pendingReview}</Badge>
          ) : (
            <Badge variant="secondary">{copy.status.notVerified}</Badge>
          )}
        </div>
        {!isConnected ? (
          <>
            <CardDescription>{copy.notVerifiedDescription}</CardDescription>
            <TrustSignal message={uiPrimitives.trustSignals.bank} />
          </>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        {bankStatementStatus === 'rejected' && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 space-y-3">
            <p className="text-sm font-medium text-destructive">
              {copy.rejection.prefix}
              {bankStatementRejectionNote ? ` · ${bankStatementRejectionNote}` : null}
            </p>
            <Button size="sm" variant="outline" onClick={onResubmit}>
              {copy.rejection.resubmitCta}
            </Button>
          </div>
        )}

        {isConnected && bankName ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-3">
            <CheckCircle className="size-5 shrink-0 text-primary" weight="duotone" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-medium text-foreground">{bankName}</p>
              <p className="text-muted-foreground">{accountNumberMasked}</p>
            </div>
          </div>
        ) : monoFailed ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <WarningCircle className="mt-0.5 size-5 shrink-0 text-destructive" weight="duotone" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">{copy.monoFailed.heading}</p>
                <p className="text-sm text-muted-foreground">
                  {error ?? copy.monoFailed.descriptionFallback}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={isBusy}
              >
                {copy.monoFailed.retryCta}
              </Button>
              <Button asChild size="sm">
                <Link href={routes.dashboard.student.documents}>
                  <FileText className="mr-2 size-4" weight="duotone" aria-hidden="true" />
                  {copy.monoFailed.uploadCta}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button
              type="button"
              className="min-h-11 w-full"
              onClick={() => {
                setError(null);
                void monoConnect.open();
              }}
              disabled={isBusy}
            >
              {monoConnect.isLoading ? copy.loadingCta : copy.monoConnectCta}
            </Button>

            <p className="text-xs text-muted-foreground">{copy.monoConnectDescription}</p>

            {monoConnect.error ? (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <Warning className="mt-0.5 size-4 shrink-0" weight="duotone" aria-hidden="true" />
                <p>{copy.errorWidget}</p>
              </div>
            ) : null}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">{copy.orDivider}</span>
              </div>
            </div>

            <Button asChild variant="outline" className="min-h-11 w-full">
              <Link href="#document-upload-form">
                <FileText className="mr-2 size-4" weight="duotone" aria-hidden="true" />
                {copy.statementUploadLabel}
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">{copy.statementUploadHint}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
