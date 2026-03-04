'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { sponsorCopy } from '@/config/copy/sponsor';
import { browserTrpcClient } from '@/trpc/client';

import { FormErrorBanner, FormSuccessBanner } from './settings-shared';
import type { SponsorSettings } from './settings-page-client';

const copy = sponsorCopy.settings;

// ── Zod schema ────────────────────────────────────────────────────────────────

const sponsorProfileSchema = z.object({
  sponsorType: z.enum(['individual', 'corporate', 'self']),
  companyName: z.string().max(120).optional(),
});

type SponsorProfileFormValues = z.infer<typeof sponsorProfileSchema>;

// ── KYC badge classes (semantic tokens only) ─────────────────────────────────

const kycBadgeClass: Record<SponsorSettings['kycStatus'], string> = {
  not_started: 'bg-muted text-muted-foreground',
  pending: 'bg-accent/20 text-accent-foreground',
  verified: 'bg-primary/10 text-primary',
  failed: 'bg-destructive/10 text-destructive',
};

const kycLabel: Record<SponsorSettings['kycStatus'], string> = {
  not_started: 'Not verified',
  pending: 'In progress',
  verified: 'Verified',
  failed: 'Failed',
};

// ── SponsorProfileSettingsForm ────────────────────────────────────────────────

export function SponsorProfileSettingsForm({ settings }: { settings: SponsorSettings }) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SponsorProfileFormValues>({
    resolver: zodResolver(sponsorProfileSchema),
    defaultValues: {
      sponsorType: settings.sponsorType ?? 'individual',
      companyName: settings.companyName ?? '',
    },
  });

  const watchedSponsorType = watch('sponsorType');

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSaved(false);

    try {
      await browserTrpcClient.sponsor.updateSponsorProfile.mutate({
        sponsorType: values.sponsorType,
        companyName:
          values.sponsorType === 'corporate' ? (values.companyName ?? null) : null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch {
      setSubmitError(copy.errors.profileSaveError);
    }
  });

  const sponsorTypeOptions: { value: 'individual' | 'corporate' | 'self'; label: string }[] = [
    { value: 'individual', label: copy.profile.sponsorTypes.individual },
    { value: 'corporate', label: copy.profile.sponsorTypes.corporate },
    { value: 'self', label: copy.profile.sponsorTypes.self },
  ];

  return (
    <Card className="border-border bg-card dark:border-border dark:bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-card-foreground">
          {copy.profile.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          {/* Sponsor type radio */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">
              {copy.profile.sponsorTypeLabel}
            </legend>
            <div className="flex flex-wrap gap-3">
              {sponsorTypeOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    value={opt.value}
                    className="accent-primary"
                    {...register('sponsorType')}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {errors.sponsorType?.message ? (
              <p className="text-sm text-destructive">{errors.sponsorType.message}</p>
            ) : null}
          </fieldset>

          {/* Company name — only for corporate */}
          {watchedSponsorType === 'corporate' ? (
            <div className="space-y-2">
              <Label htmlFor="sponsor-company-name">{copy.profile.companyNameLabel}</Label>
              <Input
                id="sponsor-company-name"
                type="text"
                placeholder={copy.profile.companyNameHint}
                className="h-11 bg-background"
                aria-invalid={Boolean(errors.companyName)}
                aria-describedby={errors.companyName ? 'sponsor-company-name-error' : undefined}
                {...register('companyName')}
              />
              {errors.companyName?.message ? (
                <p id="sponsor-company-name-error" className="text-sm text-destructive">
                  {errors.companyName.message}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* KYC status (read-only) */}
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2.5">
            <span className="text-sm font-medium text-foreground">
              {copy.profile.kycStatusLabel}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${kycBadgeClass[settings.kycStatus]}`}
            >
              {kycLabel[settings.kycStatus]}
            </span>
          </div>

          {submitError ? <FormErrorBanner message={submitError} /> : null}
          {saved ? <FormSuccessBanner message={copy.profile.savedLabel} /> : null}

          <div className="flex justify-end">
            <Button type="submit" className="min-h-11" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {copy.profile.savingLabel}
                </span>
              ) : (
                copy.profile.saveLabel
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── SponsorNotificationsCard ──────────────────────────────────────────────────

export function SponsorNotificationsCard() {
  const notificationItems = [
    copy.notifications.items.disbursement,
    copy.notifications.items.studentMilestone,
    copy.notifications.items.inviteResponse,
    copy.notifications.items.security,
  ];

  return (
    <Card className="border-border bg-card dark:border-border dark:bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-card-foreground">
          {copy.notifications.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {copy.notifications.comingSoon}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border/60">
          {notificationItems.map((item) => (
            <div
              key={item.label}
              className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch disabled aria-label={item.label} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
