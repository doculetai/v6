'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, FileText, Link2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';

import type { SponsorKycStatusSnapshot } from '@/db/queries/sponsor-kyc';

const pdfUploadSchema = z.object({
  fileName: z.string().trim().min(1, sponsorCopy.kyc.validation.fileRequired),
});

const monoConnectSchema = z.object({
  monoAccountId: z
    .string()
    .trim()
    .min(1, sponsorCopy.kyc.validation.monoReferenceRequired),
  bankName: z.string().trim().min(1, sponsorCopy.kyc.validation.bankNameRequired),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, sponsorCopy.kyc.validation.accountNumberInvalid),
});

type PdfUploadValues = z.infer<typeof pdfUploadSchema>;
type MonoConnectValues = z.infer<typeof monoConnectSchema>;

type MonoConnectResult = {
  status: 'connected' | 'failed';
  fallbackToPdf: boolean;
};

type SponsorBankVerificationProps = {
  snapshot: SponsorKycStatusSnapshot;
  onSubmitBankStatement: (values: PdfUploadValues) => Promise<void>;
  onConnectMono: (values: MonoConnectValues) => Promise<MonoConnectResult>;
  className?: string;
};

export function SponsorBankVerification({
  snapshot,
  onSubmitBankStatement,
  onConnectMono,
  className,
}: SponsorBankVerificationProps) {
  const [monoResult, setMonoResult] = useState<MonoConnectResult | null>(null);

  const pdfForm = useForm<PdfUploadValues>({
    resolver: zodResolver(pdfUploadSchema),
    defaultValues: {
      fileName: '',
    },
  });

  const monoForm = useForm<MonoConnectValues>({
    resolver: zodResolver(monoConnectSchema),
    defaultValues: {
      monoAccountId: '',
      bankName: '',
      accountNumber: '',
    },
  });

  const handlePdfSubmit = pdfForm.handleSubmit(async (values) => {
    await onSubmitBankStatement(values);
  });

  const handleMonoSubmit = monoForm.handleSubmit(async (values) => {
    const result = await onConnectMono(values);
    setMonoResult(result);
  });

  const shouldShowMonoFailure =
    snapshot.shouldOfferPdfFallback ||
    monoResult?.status === 'failed' ||
    monoResult?.fallbackToPdf === true;
  const shouldShowMonoSuccess = snapshot.hasMonoConnection || monoResult?.status === 'connected';

  return (
    <Card
      className={cn(
        'border-border/70 bg-card/85 text-card-foreground shadow-md backdrop-blur-sm dark:border-border dark:bg-card/80',
        className,
      )}
    >
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg text-card-foreground dark:text-card-foreground">
          {sponsorCopy.kyc.bank.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
          {sponsorCopy.kyc.bank.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {shouldShowMonoFailure ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 dark:border-destructive/40 dark:bg-destructive/15">
            <p className="text-sm font-medium text-destructive dark:text-destructive">
              {sponsorCopy.kyc.bank.monoFailedTitle}
            </p>
            <p className="mt-1 text-sm text-destructive dark:text-destructive">
              {sponsorCopy.kyc.bank.monoFailedBody}
            </p>
          </div>
        ) : null}

        {shouldShowMonoSuccess ? (
          <div className="rounded-xl border border-success/30 bg-success/10 p-4 dark:border-success/40 dark:bg-success/15">
            <p className="text-sm font-medium text-success dark:text-success">
              {sponsorCopy.kyc.bank.monoConnectedTitle}
            </p>
            <p className="mt-1 text-sm text-success dark:text-success">
              {sponsorCopy.kyc.bank.monoConnectedBody}
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-background/70 p-4 dark:border-border dark:bg-background/60">
            <div className="mb-4 space-y-1">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground dark:text-foreground">
                <FileText className="size-4" aria-hidden="true" />
                {sponsorCopy.kyc.bank.pdfTitle}
              </p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                {sponsorCopy.kyc.bank.pdfDescription}
              </p>
            </div>

            <form className="space-y-3" onSubmit={handlePdfSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="bank-pdf-file">{sponsorCopy.kyc.bank.pdfFileLabel}</Label>
                <Input
                  id="bank-pdf-file"
                  type="file"
                  accept=".pdf"
                  className="h-11 bg-background dark:bg-background"
                  aria-invalid={Boolean(pdfForm.formState.errors.fileName)}
                  onChange={(event) => {
                    const fileName = event.target.files?.[0]?.name ?? '';
                    pdfForm.setValue('fileName', fileName, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
                {pdfForm.formState.errors.fileName?.message ? (
                  <p className="text-sm text-destructive dark:text-destructive">
                    {pdfForm.formState.errors.fileName.message}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="min-h-11 w-full" disabled={pdfForm.formState.isSubmitting}>
                {pdfForm.formState.isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    {sponsorCopy.kyc.bank.pdfSubmittingLabel}
                  </span>
                ) : (
                  sponsorCopy.kyc.bank.pdfSubmitLabel
                )}
              </Button>
            </form>
          </div>

          <div className="rounded-xl border border-border bg-background/70 p-4 dark:border-border dark:bg-background/60">
            <div className="mb-4 space-y-1">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground dark:text-foreground">
                <Link2 className="size-4" aria-hidden="true" />
                {sponsorCopy.kyc.bank.monoTitle}
              </p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                {sponsorCopy.kyc.bank.monoDescription}
              </p>
            </div>

            <form className="space-y-3" onSubmit={handleMonoSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="mono-account-id">{sponsorCopy.kyc.bank.monoAccountIdLabel}</Label>
                <Input
                  id="mono-account-id"
                  placeholder={sponsorCopy.kyc.bank.monoAccountIdPlaceholder}
                  className="h-11 bg-background dark:bg-background"
                  aria-invalid={Boolean(monoForm.formState.errors.monoAccountId)}
                  {...monoForm.register('monoAccountId')}
                />
                {monoForm.formState.errors.monoAccountId?.message ? (
                  <p className="text-sm text-destructive dark:text-destructive">
                    {monoForm.formState.errors.monoAccountId.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mono-bank-name">{sponsorCopy.kyc.bank.bankNameLabel}</Label>
                <Input
                  id="mono-bank-name"
                  placeholder={sponsorCopy.kyc.bank.bankNamePlaceholder}
                  className="h-11 bg-background dark:bg-background"
                  aria-invalid={Boolean(monoForm.formState.errors.bankName)}
                  {...monoForm.register('bankName')}
                />
                {monoForm.formState.errors.bankName?.message ? (
                  <p className="text-sm text-destructive dark:text-destructive">
                    {monoForm.formState.errors.bankName.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mono-account-number">{sponsorCopy.kyc.bank.accountNumberLabel}</Label>
                <Input
                  id="mono-account-number"
                  inputMode="numeric"
                  placeholder={sponsorCopy.kyc.bank.accountNumberPlaceholder}
                  className="h-11 bg-background dark:bg-background"
                  aria-invalid={Boolean(monoForm.formState.errors.accountNumber)}
                  {...monoForm.register('accountNumber')}
                />
                {monoForm.formState.errors.accountNumber?.message ? (
                  <p className="text-sm text-destructive dark:text-destructive">
                    {monoForm.formState.errors.accountNumber.message}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="min-h-11 w-full"
                disabled={monoForm.formState.isSubmitting}
              >
                {monoForm.formState.isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    {sponsorCopy.kyc.bank.monoSubmittingLabel}
                  </span>
                ) : (
                  sponsorCopy.kyc.bank.monoSubmitLabel
                )}
              </Button>
            </form>

            <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-card/80 p-3 dark:border-border dark:bg-card/70">
              <AlertTriangle className="mt-0.5 size-4 text-muted-foreground dark:text-muted-foreground" aria-hidden="true" />
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                {sponsorCopy.kyc.bank.monoDescription}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
