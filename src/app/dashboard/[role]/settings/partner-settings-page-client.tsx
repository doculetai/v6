'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Warning, CircleNotch } from '@/components/icons';
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
import { Container, Stack } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { SessionManagementWithData } from '@/components/settings/SessionManagementWithData';
import { partnerCopy } from '@/config/copy/partner';
import { browserTrpcClient, trpc } from '@/trpc/client';

import { FormErrorBanner, FormSuccessBanner } from './settings-shared';
import { routes } from '@/config/routes';

// ── Types ─────────────────────────────────────────────────────────────────────

type PartnerSettings = {
  organizationName: string;
  webhookUrl: string | null;
  webhookIsActive?: boolean;
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
  security: {
    sectionTitle: string;
    sectionDescription: string;
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

const webhookDisabledCopy = partnerCopy.webhookDisabled;

function WebhookDisabledBanner() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const reEnable = trpc.partner.reEnableWebhook.useMutation({
    onSuccess() {
      setFeedback(webhookDisabledCopy.reEnableSuccess);
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  return (
    <div className="rounded-lg border border-amber-300/40 bg-amber-50/60 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-950/20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{webhookDisabledCopy.heading}</p>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              {webhookDisabledCopy.badge}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{webhookDisabledCopy.body}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="min-h-9"
          disabled={reEnable.isPending}
          onClick={() => reEnable.mutate()}
        >
          {reEnable.isPending ? webhookDisabledCopy.reEnablingCta : webhookDisabledCopy.reEnableCta}
        </Button>
      </div>
      {feedback && (
        <p className="mt-2 text-xs font-medium text-[#0F766E]" role="status">{feedback}</p>
      )}
    </div>
  );
}

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

          {/* Webhook disabled state */}
          {settings.webhookUrl && settings.webhookIsActive === false && (
            <WebhookDisabledBanner />
          )}

          {saveError ? <FormErrorBanner message={saveError} /> : null}
          {saved ? <FormSuccessBanner message={copy.profile.savedLabel} /> : null}

          <div className="flex justify-end">
            <Button type="submit" className="min-h-11" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <CircleNotch weight="bold" className="size-4 animate-spin" aria-hidden="true" />
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
      <Container width="md" noPadding>
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <Card className="border-border bg-card dark:border-border dark:bg-card">
          <CardHeader className="space-y-3">
            <Warning weight="duotone" className="size-5 text-destructive" aria-hidden="true" />
            <CardTitle className="text-lg text-card-foreground">
              {copy.errors.loadError}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="min-h-11">
              <Link href={routes.dashboard.partner.settings}>{copy.errors.tryAgain}</Link>
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container width="md" noPadding><Stack gap="md">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <PartnerProfileForm settings={settings} copy={copy} />
      <Card className="border-border bg-card dark:border-border dark:bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-card-foreground">
            {copy.security.sectionTitle}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {copy.security.sectionDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionManagementWithData />
        </CardContent>
      </Card>
    </Stack></Container>
  );
}
