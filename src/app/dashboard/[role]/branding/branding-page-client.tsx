'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { BrandingPreviewCard } from '@/components/partner/BrandingPreviewCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { partnerCopy } from '@/config/copy/partner';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

const brandingFormSchema = z.object({
  brandLogoUrl: z.union([z.string().url('Enter a valid URL (e.g. https://...)'), z.literal('')]),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Enter a valid hex colour'),
});

type BrandingFormValues = z.infer<typeof brandingFormSchema>;

type BrandingData = {
  organizationName: string;
  brandLogoUrl: string | null;
  brandColor: string | null;
};

type BrandingPageClientProps = {
  initialData: BrandingData;
};

export function BrandingPageClient({ initialData }: BrandingPageClientProps) {
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingFormSchema),
    defaultValues: {
      brandLogoUrl: initialData.brandLogoUrl ?? '',
      brandColor: initialData.brandColor ?? '#1e40af',
    },
  });

  const watchedLogoUrl = useWatch({ control, name: 'brandLogoUrl' });
  const watchedColor = useWatch({ control, name: 'brandColor' });

  const updateBranding = trpc.partner.updateBranding.useMutation({
    onSuccess: () => {
      setSaveError(null);
      setSuccessMessage(partnerCopy.branding.saveSuccess);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    },
    onError: () => {
      setSaveError(partnerCopy.errors.generic);
    },
  });

  const onSubmit = (data: BrandingFormValues) => {
    setSaveError(null);
    updateBranding.mutate({
      brandLogoUrl: data.brandLogoUrl.trim() === '' ? null : data.brandLogoUrl,
      brandColor: data.brandColor,
    });
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-foreground dark:text-foreground md:text-5xl">
          {partnerCopy.branding.title}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
          {partnerCopy.branding.subtitle}
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Form sections */}
          <div className="space-y-6">
            {/* Logo URL */}
            <Card className="border-border bg-card/80 dark:border-border dark:bg-card/80">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base text-card-foreground dark:text-card-foreground">
                  {partnerCopy.branding.logoSection.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {partnerCopy.branding.logoSection.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="brandLogoUrl"
                    className="text-sm text-foreground dark:text-foreground"
                  >
                    {partnerCopy.branding.logoSection.currentLabel}
                  </Label>
                  <Input
                    id="brandLogoUrl"
                    type="url"
                    placeholder="https://yourinstitution.edu.ng/logo.png"
                    className={cn(
                      'min-h-11 border-input bg-background text-foreground placeholder:text-muted-foreground dark:border-input dark:bg-background dark:text-foreground',
                      errors.brandLogoUrl &&
                        'border-destructive focus-visible:ring-destructive dark:border-destructive',
                    )}
                    {...register('brandLogoUrl')}
                  />
                  {errors.brandLogoUrl ? (
                    <p className="text-sm text-destructive dark:text-destructive" role="alert">
                      {errors.brandLogoUrl.message}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {partnerCopy.branding.logoSection.requirements}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Brand colour */}
            <Card className="border-border bg-card/80 dark:border-border dark:bg-card/80">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base text-card-foreground dark:text-card-foreground">
                  {partnerCopy.branding.colorSection.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {partnerCopy.branding.colorSection.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="brandColor"
                    className="text-sm text-foreground dark:text-foreground"
                  >
                    {partnerCopy.branding.colorSection.primaryLabel}
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="brandColor"
                      type="color"
                      className="size-10 min-h-[44px] min-w-[44px] cursor-pointer rounded-md border border-input bg-transparent p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...register('brandColor')}
                    />
                    <code className="text-sm tabular-nums text-foreground dark:text-foreground">
                      {watchedColor}
                    </code>
                  </div>
                  {errors.brandColor ? (
                    <p className="text-sm text-destructive dark:text-destructive" role="alert">
                      {errors.brandColor.message}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* Custom domain — UI only, no DB persistence yet */}
            <Card className="border-border bg-card/80 dark:border-border dark:bg-card/80">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base text-card-foreground dark:text-card-foreground">
                    {partnerCopy.branding.domainSection.title}
                  </CardTitle>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground dark:bg-muted dark:text-muted-foreground">
                    Coming soon
                  </span>
                </div>
                <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {partnerCopy.branding.domainSection.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="customDomain"
                    className="text-sm text-muted-foreground dark:text-muted-foreground"
                  >
                    {partnerCopy.branding.domainSection.domainLabel}
                  </Label>
                  <Input
                    id="customDomain"
                    type="text"
                    disabled
                    placeholder={partnerCopy.branding.domainSection.domainPlaceholder}
                    className="min-h-11 cursor-not-allowed border-input bg-muted text-muted-foreground dark:border-input dark:bg-muted"
                  />
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    {partnerCopy.branding.domainSection.instructions}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                type="submit"
                className="min-h-11"
                disabled={updateBranding.isPending}
              >
                {updateBranding.isPending ? 'Saving…' : partnerCopy.branding.saveCta}
              </Button>

              {successMessage ? (
                <div
                  className="flex items-center gap-2 text-sm text-foreground dark:text-foreground"
                  role="status"
                >
                  <CheckCircle
                    className="size-4 shrink-0 text-success dark:text-success"
                    aria-hidden="true"
                  />
                  {successMessage}
                </div>
              ) : null}

              {saveError ? (
                <p className="text-sm text-destructive dark:text-destructive" role="alert">
                  {saveError}
                </p>
              ) : null}
            </div>
          </div>

          {/* Preview — sticky on desktop */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Card className="border-border bg-card/80 dark:border-border dark:bg-card/80">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base text-card-foreground dark:text-card-foreground">
                  {partnerCopy.branding.previewSection.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {partnerCopy.branding.previewSection.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BrandingPreviewCard
                  organizationName={initialData.organizationName}
                  brandLogoUrl={watchedLogoUrl || null}
                  brandColor={watchedColor}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </section>
  );
}
