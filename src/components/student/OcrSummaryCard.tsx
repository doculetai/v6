'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FileText } from '@/components/icons';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { studentCopy } from '@/config/copy/student';

type ManualData = {
  name: string;
  accountNumber: string;
  bankName: string;
  balance: string;
};

type OcrSummaryCardProps = {
  extractedName: string | null;
  extractedAmount: string | null;
  confidence: number | null;
  onPreview: () => void;
  onConfirm: (manualData?: ManualData) => void;
  onCancel: () => void;
  isCancelling?: boolean;
};

const manualValidation = studentCopy.ocrCard.manualValidation;

const manualEntrySchema = z.object({
  name: z.string().min(1, manualValidation.nameRequired),
  accountNumber: z.string().min(1, manualValidation.accountNumberRequired),
  bankName: z.string().min(1, manualValidation.bankNameRequired),
  balance: z.string().min(1, manualValidation.balanceRequired),
});

type ManualEntryFormValues = z.infer<typeof manualEntrySchema>;

function ManualEntryForm({
  copy,
  onConfirm,
  onCancel,
  isCancelling,
}: {
  copy: typeof studentCopy.ocrCard;
  onConfirm: (data: ManualData) => void;
  onCancel: () => void;
  isCancelling?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManualEntryFormValues>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: { name: '', accountNumber: '', bankName: '', balance: '' },
  });

  function onSubmit(values: ManualEntryFormValues) {
    onConfirm(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="ocr-name" className="text-xs">
          {copy.manualFields.nameLabel}
        </Label>
        <Input
          id="ocr-name"
          placeholder={copy.manualFields.namePlaceholder}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'ocr-name-error' : undefined}
          {...register('name')}
        />
        {errors.name ? (
          <p id="ocr-name-error" className="text-xs text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="ocr-account-number" className="text-xs">
          {copy.manualFields.accountNumberLabel}
        </Label>
        <Input
          id="ocr-account-number"
          placeholder={copy.manualFields.accountNumberPlaceholder}
          aria-invalid={!!errors.accountNumber}
          aria-describedby={errors.accountNumber ? 'ocr-account-number-error' : undefined}
          {...register('accountNumber')}
        />
        {errors.accountNumber ? (
          <p id="ocr-account-number-error" className="text-xs text-destructive">{errors.accountNumber.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="ocr-bank-name" className="text-xs">
          {copy.manualFields.bankNameLabel}
        </Label>
        <Input
          id="ocr-bank-name"
          placeholder={copy.manualFields.bankNamePlaceholder}
          aria-invalid={!!errors.bankName}
          aria-describedby={errors.bankName ? 'ocr-bank-name-error' : undefined}
          {...register('bankName')}
        />
        {errors.bankName ? (
          <p id="ocr-bank-name-error" className="text-xs text-destructive">{errors.bankName.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="ocr-balance" className="text-xs">
          {copy.manualFields.balanceLabel}
        </Label>
        <Input
          id="ocr-balance"
          placeholder={copy.manualFields.balancePlaceholder}
          aria-invalid={!!errors.balance}
          aria-describedby={errors.balance ? 'ocr-balance-error' : undefined}
          {...register('balance')}
        />
        {errors.balance ? (
          <p id="ocr-balance-error" className="text-xs text-destructive">{errors.balance.message}</p>
        ) : null}
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" className="min-h-[44px] text-xs">
          {copy.ocrConfirm}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-[44px] text-xs"
          onClick={onCancel}
          disabled={isCancelling}
        >
          {isCancelling ? copy.ocrCancelling : copy.ocrCancel}
        </Button>
      </div>
    </form>
  );
}

export function OcrSummaryCard({
  extractedName,
  extractedAmount,
  confidence,
  onPreview,
  onConfirm,
  onCancel,
  isCancelling,
}: OcrSummaryCardProps) {
  const copy = studentCopy.ocrCard;

  const hasData = extractedName !== null || extractedAmount !== null;

  return (
    <Card className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10">
      <CardHeader className="flex flex-row items-start gap-2 pb-2">
        <FileText className="mt-0.5 size-4 text-primary" weight="duotone" aria-hidden="true" />
        <CardTitle className="text-sm font-medium text-foreground">{copy.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {hasData ? (
          <>
            <p className="text-xs text-muted-foreground">{copy.submittedLabel}</p>
            <dl className="space-y-1 text-sm">
              {extractedName ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{copy.fieldLabels.accountHolder}</dt>
                  <dd className="font-medium text-foreground">{extractedName}</dd>
                </div>
              ) : null}
              {extractedAmount ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{copy.fieldLabels.balance}</dt>
                  <dd className="font-medium text-foreground">{extractedAmount}</dd>
                </div>
              ) : null}
            </dl>

            {confidence !== null ? (
              <p className="text-xs text-muted-foreground">{copy.confidenceLabel(confidence)}</p>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-[44px] px-2 text-xs"
              onClick={onPreview}
            >
              <FileText className="mr-1 size-3" weight="duotone" aria-hidden="true" />
              {copy.previewCta}
            </Button>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                className="min-h-[44px] text-xs"
                onClick={() => onConfirm()}
              >
                {copy.ocrConfirm}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-[44px] text-xs"
                onClick={onCancel}
                disabled={isCancelling}
              >
                {isCancelling ? copy.ocrCancelling : copy.ocrCancel}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-medium text-destructive">{copy.ocrManualNote}</p>
            <ManualEntryForm
              copy={copy}
              onConfirm={onConfirm}
              onCancel={onCancel}
              isCancelling={isCancelling}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
