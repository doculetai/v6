'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { type partnerCopy } from '@/config/copy/partner';
import { trpc } from '@/trpc/client';

const schema = z.object({
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable(),
  webhookUrl: z.string().url().or(z.literal('')).nullable(),
});

type FormValues = z.infer<typeof schema>;

type Branding = {
  brandLogoUrl: string | null;
  brandColor: string | null;
  organizationName: string;
  webhookUrl: string | null;
};

type Props = {
  branding: Branding | null;
  copy: typeof partnerCopy.branding;
};

export function BrandingPageClient({ branding, copy }: Props) {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateMutation = trpc.partner.updatePartnerBranding.useMutation({
    onSuccess() {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      brandColor: branding?.brandColor ?? null,
      webhookUrl: branding?.webhookUrl ?? null,
    },
  });

  function onSubmit(data: FormValues) {
    updateMutation.mutate({
      brandColor: data.brandColor,
      webhookUrl: data.webhookUrl === '' ? null : data.webhookUrl,
    });
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{copy.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      {branding === null ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.error.description}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {/* Color section */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">{copy.colorSection.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.colorSection.description}</p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="brandColor"
                  className="text-sm font-medium text-foreground"
                >
                  {copy.colorSection.primaryLabel}
                </label>
                <span className="rounded-full border border-border bg-card px-2 py-0.5 font-mono text-xs text-foreground">
                  {watch('brandColor') ?? '—'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="brandColor"
                  type="text"
                  {...register('brandColor')}
                  placeholder="#3B82F6"
                  className="h-10 w-36 rounded-lg border border-border bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              {errors.brandColor && (
                <p className="text-xs text-destructive">{errors.brandColor.message}</p>
              )}
            </div>
          </div>

          {/* Webhook / Domain section */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">{copy.domainSection.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.domainSection.description}</p>

            <div className="mt-4">
              <label
                htmlFor="webhookUrl"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                {copy.domainSection.domainLabel}
              </label>
              <input
                id="webhookUrl"
                type="url"
                {...register('webhookUrl')}
                placeholder={copy.domainSection.domainHint}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:max-w-md"
              />
              {errors.webhookUrl && (
                <p className="mt-1 text-xs text-destructive">{errors.webhookUrl.message}</p>
              )}
            </div>
          </div>

          {/* Save */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {updateMutation.isPending ? copy.savingCta : copy.saveCta}
            </button>
            {saveSuccess && (
              <p className="text-sm text-primary">{copy.saveSuccess}</p>
            )}
            {updateMutation.isError && (
              <p className="text-sm text-destructive">
                {copy.error.title}. {copy.error.description}
              </p>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
