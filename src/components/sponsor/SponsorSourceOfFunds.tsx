'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Loader2, Wallet } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';

import type { SponsorKycStatusSnapshot } from '@/db/queries/sponsor-kyc';

const sourceOfFundsSchema = z
  .object({
    sponsorType: z.enum(['individual', 'corporate', 'self']),
    sourceOfFundsType: z.enum(['salary', 'business', 'savings', 'investment']),
    sourceOfFundsAmountNaira: z.number().int().positive(sponsorCopy.kyc.validation.amountRequired),
    cacRegistrationNumber: z.string().trim().optional(),
    directorBvn: z.string().trim().optional(),
    sponsorshipLetterFileName: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (value.sponsorType !== 'corporate') {
      return;
    }

    if (!value.cacRegistrationNumber) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cacRegistrationNumber'],
        message: sponsorCopy.kyc.validation.cacRequired,
      });
    }

    if (!value.directorBvn || !/^\d{11}$/.test(value.directorBvn)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['directorBvn'],
        message: sponsorCopy.kyc.validation.directorBvnInvalid,
      });
    }

    if (!value.sponsorshipLetterFileName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sponsorshipLetterFileName'],
        message: sponsorCopy.kyc.validation.letterRequired,
      });
    }
  });

type SourceOfFundsFormValues = z.infer<typeof sourceOfFundsSchema>;

type SponsorSourceOfFundsProps = {
  snapshot: SponsorKycStatusSnapshot;
  onSubmitSourceOfFunds: (values: SourceOfFundsFormValues) => Promise<void>;
  className?: string;
};

function sponsorTypeButtonClass(active: boolean): string {
  if (active) {
    return 'border-primary/40 bg-primary/10 text-primary dark:border-primary/50 dark:bg-primary/15 dark:text-primary';
  }

  return 'border-border bg-background text-foreground hover:bg-accent dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-accent';
}

export function SponsorSourceOfFunds({
  snapshot,
  onSubmitSourceOfFunds,
  className,
}: SponsorSourceOfFundsProps) {
  const form = useForm<SourceOfFundsFormValues>({
    resolver: zodResolver(sourceOfFundsSchema),
    defaultValues: {
      sponsorType: snapshot.sponsorType,
      sourceOfFundsType: snapshot.sourceOfFundsType ?? undefined,
      sourceOfFundsAmountNaira: snapshot.sourceOfFundsAmountNaira ?? undefined,
      cacRegistrationNumber: '',
      directorBvn: '',
      sponsorshipLetterFileName: '',
    },
  });

  const sponsorType = form.watch('sponsorType');

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmitSourceOfFunds(values);
  });

  return (
    <Card
      className={cn(
        'border-border/70 bg-card/85 text-card-foreground shadow-md backdrop-blur-sm dark:border-border dark:bg-card/80',
        className,
      )}
    >
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg text-card-foreground dark:text-card-foreground">
          {sponsorCopy.kyc.sourceOfFunds.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
          {sponsorCopy.kyc.sourceOfFunds.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label>{sponsorCopy.kyc.sourceOfFunds.sponsorTypeLabel}</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'min-h-11 justify-start gap-2',
                  sponsorTypeButtonClass(sponsorType === 'individual'),
                )}
                onClick={() => form.setValue('sponsorType', 'individual', { shouldDirty: true })}
              >
                <Wallet className="size-4" aria-hidden="true" />
                {sponsorCopy.kyc.sourceOfFunds.sponsorTypeIndividual}
              </Button>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'min-h-11 justify-start gap-2',
                  sponsorTypeButtonClass(sponsorType === 'corporate'),
                )}
                onClick={() => form.setValue('sponsorType', 'corporate', { shouldDirty: true })}
              >
                <Building2 className="size-4" aria-hidden="true" />
                {sponsorCopy.kyc.sourceOfFunds.sponsorTypeCorporate}
              </Button>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'min-h-11 justify-start gap-2',
                  sponsorTypeButtonClass(sponsorType === 'self'),
                )}
                onClick={() => form.setValue('sponsorType', 'self', { shouldDirty: true })}
              >
                <Building2 className="size-4" aria-hidden="true" />
                {sponsorCopy.kyc.sourceOfFunds.sponsorTypeSelf}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="source-of-funds-select">{sponsorCopy.kyc.sourceOfFunds.sourceLabel}</Label>
              <Controller
                name="sourceOfFundsType"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="source-of-funds-select"
                      className="h-11 w-full bg-background dark:bg-background"
                      aria-invalid={Boolean(form.formState.errors.sourceOfFundsType)}
                    >
                      <SelectValue placeholder={sponsorCopy.kyc.sourceOfFunds.sourcePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">{sponsorCopy.kyc.sourceOfFunds.sourceSalary}</SelectItem>
                      <SelectItem value="business">
                        {sponsorCopy.kyc.sourceOfFunds.sourceBusiness}
                      </SelectItem>
                      <SelectItem value="savings">{sponsorCopy.kyc.sourceOfFunds.sourceSavings}</SelectItem>
                      <SelectItem value="investment">
                        {sponsorCopy.kyc.sourceOfFunds.sourceInvestment}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.sourceOfFundsType?.message ? (
                <p className="text-sm text-destructive dark:text-destructive">
                  {form.formState.errors.sourceOfFundsType.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="source-funds-amount">{sponsorCopy.kyc.sourceOfFunds.amountLabel}</Label>
              <Input
                id="source-funds-amount"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder={sponsorCopy.kyc.sourceOfFunds.amountPlaceholder}
                className="h-11 bg-background dark:bg-background"
                aria-invalid={Boolean(form.formState.errors.sourceOfFundsAmountNaira)}
                {...form.register('sourceOfFundsAmountNaira', { valueAsNumber: true })}
              />
              {form.formState.errors.sourceOfFundsAmountNaira?.message ? (
                <p className="text-sm text-destructive dark:text-destructive">
                  {form.formState.errors.sourceOfFundsAmountNaira.message}
                </p>
              ) : null}
            </div>
          </div>

          {sponsorType === 'corporate' ? (
            <div className="space-y-4 rounded-xl border border-border bg-background/70 p-4 dark:border-border dark:bg-background/60">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground dark:text-foreground">
                  {sponsorCopy.kyc.sourceOfFunds.corporateBlockTitle}
                </p>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {sponsorCopy.kyc.sourceOfFunds.corporateBlockDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="corporate-cac">{sponsorCopy.kyc.sourceOfFunds.cacLabel}</Label>
                  <Input
                    id="corporate-cac"
                    placeholder={sponsorCopy.kyc.sourceOfFunds.cacPlaceholder}
                    className="h-11 bg-background dark:bg-background"
                    aria-invalid={Boolean(form.formState.errors.cacRegistrationNumber)}
                    {...form.register('cacRegistrationNumber')}
                  />
                  {form.formState.errors.cacRegistrationNumber?.message ? (
                    <p className="text-sm text-destructive dark:text-destructive">
                      {form.formState.errors.cacRegistrationNumber.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="director-bvn">{sponsorCopy.kyc.sourceOfFunds.directorBvnLabel}</Label>
                  <Input
                    id="director-bvn"
                    inputMode="numeric"
                    placeholder={sponsorCopy.kyc.sourceOfFunds.directorBvnPlaceholder}
                    className="h-11 bg-background dark:bg-background"
                    aria-invalid={Boolean(form.formState.errors.directorBvn)}
                    {...form.register('directorBvn')}
                  />
                  {form.formState.errors.directorBvn?.message ? (
                    <p className="text-sm text-destructive dark:text-destructive">
                      {form.formState.errors.directorBvn.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sponsorship-letter">{sponsorCopy.kyc.sourceOfFunds.letterLabel}</Label>
                <Input
                  id="sponsorship-letter"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="h-11 bg-background dark:bg-background"
                  aria-invalid={Boolean(form.formState.errors.sponsorshipLetterFileName)}
                  onChange={(event) => {
                    const fileName = event.target.files?.[0]?.name ?? '';
                    form.setValue('sponsorshipLetterFileName', fileName, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
                {form.formState.errors.sponsorshipLetterFileName?.message ? (
                  <p className="text-sm text-destructive dark:text-destructive">
                    {form.formState.errors.sponsorshipLetterFileName.message}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <Button type="submit" className="min-h-11 w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {sponsorCopy.kyc.sourceOfFunds.savingLabel}
              </span>
            ) : (
              sponsorCopy.kyc.sourceOfFunds.submitLabel
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
