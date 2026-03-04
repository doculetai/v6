'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { browserTrpcClient } from '@/trpc/client';

import { FormErrorBanner, FormSuccessBanner } from './settings-shared';

// ── Types ─────────────────────────────────────────────────────────────────────

type PartnerSettings = {
  organizationName: string;
  webhookUrl: string | null;
  brandColor: string | null;
  brandLogoUrl: string | null;
};

type PartnerSettingsCopy = {
  title: string;
  subtitle: string;
  profile: {
    sectionTitle: string;
    sectionDescription: string;
    orgNameLabel: string;
    orgNameHint: string;
    webhookLabel: string;
    webhookHint: string;
    webhookDescription: string;
    saveLabel: string;
    savingLabel: string;
    savedLabel: string;
  };
  validation: {
    orgNameMin: string;
    orgNameMax: string;
    webhookInvalid: string;
  };
  errors: {
    loadError: string;
    saveError: string;
    tryAgain: string;
  };
};

type Props = {
  settings: PartnerSettings | null;
  copy: PartnerSettingsCopy;
};

// ── Zod schema ────────────────────────────────────────────────────────────────

function buildSchema(copy: PartnerSettingsCopy) {
  return z.object({
    organizationName: z
      .string()
      .min(2, copy.validation.orgNameMin)
      .max(120, copy.validation.orgNameMax),
    webhookUrl: z
      .string()
      .refine(
        (v) => v === '' || (v.startsWith('https://') && z.string().url().safeParse(v).success),
        copy.validation.webhookInvalid,
      ),
  });
}

type FormValues = {
  organizationName: string;
  webhookUrl: string;
};

// ── Partner settings form ─────────────────────────────────────────────────────

function PartnerProfileForm({
  settings,
  copy,
}: {
  settings: PartnerSettings;
  copy: PartnerSettingsCopy;
}) {
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const schema = buildSchema(copy);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      organizationName: settings.organizationName,
      webhookUrl: settings.webhookUrl ?? '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setSaveError(null);
    setSaved(false);

    try {
      await browserTrpcClient.partner.updatePartnerSettings.mutate({
        organizationName: data.organizationName,
        webhookUrl: data.webhookUrl || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch {
      setSaveError(copy.errors.saveError);
    }
  });

  return (
    <Card className="border-border bg-card dark:border-border dark:bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-card-foreground">
          {copy.profile.sectionTitle}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {copy.profile.sectionDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          {/* Organisation name */}
          <div className="space-y-2">
            <Label htmlFor="partner-org-name">{copy.profile.orgNameLabel}</Label>
            <Input
              id="partner-org-name"
              type="text"
              placeholder={copy.profile.orgNameHint}
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.organizationName)}
              aria-describedby={
                errors.organizationName ? 'partner-org-name-error' : undefined
              }
              {...register('organizationName')}
            />
            {errors.organizationName?.message ? (
              <p id="partner-org-name-error" className="text-sm text-destructive">
                {errors.organizationName.message}
              </p>
            ) : null}
          </div>

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="partner-webhook-url">{copy.profile.webhookLabel}</Label>
            <Input
              id="partner-webhook-url"
              type="url"
              placeholder={copy.profile.webhookHint}
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.webhookUrl)}
              aria-describedby={[
                'partner-webhook-description',
                errors.webhookUrl ? 'partner-webhook-url-error' : undefined,
              ]
                .filter(Boolean)
                .join(' ')}
              {...register('webhookUrl')}
            />
            <p
              id="partner-webhook-description"
              className="text-xs text-muted-foreground"
            >
              {copy.profile.webhookDescription}
            </p>
            {errors.webhookUrl?.message ? (
              <p id="partner-webhook-url-error" className="text-sm text-destructive">
                {errors.webhookUrl.message}
              </p>
            ) : null}
          </div>

          {saveError ? <FormErrorBanner message={saveError} /> : null}
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

// ── Main export ───────────────────────────────────────────────────────────────

export function PartnerSettingsPageClient({ settings, copy }: Props) {
  if (!settings) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="sr-only">{copy.title}</h1>
        <Card className="border-border bg-card dark:border-border dark:bg-card">
          <CardHeader className="space-y-3">
            <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
            <CardTitle className="text-lg text-card-foreground">
              {copy.errors.loadError}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/dashboard/partner/settings">{copy.errors.tryAgain}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <PartnerProfileForm settings={settings} copy={copy} />
    </div>
  );
}
