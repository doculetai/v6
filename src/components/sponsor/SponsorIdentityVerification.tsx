'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';

import type { SponsorIdentityMethod, SponsorKycStatusSnapshot } from '@/db/queries/sponsor-kyc';

const identitySchema = z
  .object({
    identityMethod: z.enum(['nin', 'passport']),
    nin: z.string().trim().optional(),
    passportNumber: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (value.identityMethod === 'nin') {
      if (!value.nin || !/^\d{11}$/.test(value.nin)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['nin'],
          message: sponsorCopy.kyc.validation.ninInvalid,
        });
      }
      return;
    }

    if (!value.passportNumber) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['passportNumber'],
        message: sponsorCopy.kyc.validation.passportRequired,
      });
    }
  });

type IdentityFormValues = z.infer<typeof identitySchema>;

type SponsorIdentityVerificationProps = {
  snapshot: SponsorKycStatusSnapshot;
  onSubmitIdentity: (values: IdentityFormValues) => Promise<void>;
  className?: string;
};

function optionButtonClass(selected: boolean): string {
  if (selected) {
    return 'border-primary/40 bg-primary/10 text-primary dark:border-primary/50 dark:bg-primary/15 dark:text-primary';
  }

  return 'border-border bg-background text-foreground hover:bg-accent dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-accent';
}

export function SponsorIdentityVerification({
  snapshot,
  onSubmitIdentity,
  className,
}: SponsorIdentityVerificationProps) {
  const form = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      identityMethod: snapshot.identityMethod ?? 'nin',
      nin: '',
      passportNumber: '',
    },
  });

  const method = form.watch('identityMethod');

  const handleSelectMethod = (nextMethod: SponsorIdentityMethod) => {
    form.setValue('identityMethod', nextMethod, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    await onSubmitIdentity(values);
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
          {sponsorCopy.kyc.identity.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
          {sponsorCopy.kyc.identity.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>{sponsorCopy.kyc.identity.methodLabel}</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className={cn('min-h-11 justify-start gap-2', optionButtonClass(method === 'nin'))}
              onClick={() => handleSelectMethod('nin')}
            >
              <Shield className="size-4" aria-hidden="true" />
              {sponsorCopy.kyc.identity.methodNin}
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn('min-h-11 justify-start gap-2', optionButtonClass(method === 'passport'))}
              onClick={() => handleSelectMethod('passport')}
            >
              <FileText className="size-4" aria-hidden="true" />
              {sponsorCopy.kyc.identity.methodPassport}
            </Button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {method === 'nin' ? (
            <div className="space-y-2">
              <Label htmlFor="sponsor-nin">{sponsorCopy.kyc.identity.ninLabel}</Label>
              <Input
                id="sponsor-nin"
                placeholder={sponsorCopy.kyc.identity.ninPlaceholder}
                inputMode="numeric"
                aria-invalid={Boolean(form.formState.errors.nin)}
                className="h-11 bg-background dark:bg-background"
                {...form.register('nin')}
              />
              {form.formState.errors.nin?.message ? (
                <p className="text-sm text-destructive dark:text-destructive">
                  {form.formState.errors.nin.message}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="sponsor-passport">{sponsorCopy.kyc.identity.passportLabel}</Label>
              <Input
                id="sponsor-passport"
                placeholder={sponsorCopy.kyc.identity.passportPlaceholder}
                aria-invalid={Boolean(form.formState.errors.passportNumber)}
                className="h-11 bg-background dark:bg-background"
                {...form.register('passportNumber')}
              />
              {form.formState.errors.passportNumber?.message ? (
                <p className="text-sm text-destructive dark:text-destructive">
                  {form.formState.errors.passportNumber.message}
                </p>
              ) : null}
            </div>
          )}

          <Button type="submit" className="min-h-11 w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {sponsorCopy.kyc.identity.savingLabel}
              </span>
            ) : (
              sponsorCopy.kyc.identity.submitLabel
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
