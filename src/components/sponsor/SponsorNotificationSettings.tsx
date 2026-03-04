'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bell, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';
import {
  sponsorNotificationSettingsSchema,
  type SponsorNotificationSettings,
} from '@/server/routers/sponsor.schemas';

type SponsorNotificationSettingsProps = {
  initialValues: SponsorNotificationSettings;
  onSubmit: (values: SponsorNotificationSettings) => Promise<void>;
  isSaving: boolean;
  submitError: string | null;
  submitSuccess: string | null;
};

type ToggleFieldName = keyof SponsorNotificationSettings;

type ToggleItem = {
  name: ToggleFieldName;
  label: string;
  description: string;
};

const toggleItems: ToggleItem[] = [
  {
    name: 'emailFundingUpdates',
    label: sponsorCopy.settings.notifications.fundingUpdatesLabel,
    description: sponsorCopy.settings.notifications.fundingUpdatesDescription,
  },
  {
    name: 'emailVerificationUpdates',
    label: sponsorCopy.settings.notifications.verificationUpdatesLabel,
    description: sponsorCopy.settings.notifications.verificationUpdatesDescription,
  },
  {
    name: 'emailSecurityAlerts',
    label: sponsorCopy.settings.notifications.securityAlertsLabel,
    description: sponsorCopy.settings.notifications.securityAlertsDescription,
  },
];

function ToggleControl({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (nextValue: boolean) => void;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-11 w-20 items-center rounded-full border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked
          ? 'border-primary bg-primary/20 dark:bg-primary/25'
          : 'border-border bg-muted/50 dark:bg-muted/30',
      )}
    >
      <span
        className={cn(
          'inline-block size-8 rounded-full bg-background shadow-sm transition-transform duration-200',
          checked ? 'translate-x-10' : 'translate-x-1',
        )}
      />
    </button>
  );
}

export function SponsorNotificationSettings({
  initialValues,
  onSubmit,
  isSaving,
  submitError,
  submitSuccess,
}: SponsorNotificationSettingsProps) {
  const { control, handleSubmit, reset } = useForm<SponsorNotificationSettings>({
    resolver: zodResolver(sponsorNotificationSettingsSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur-sm dark:border-border/70 dark:bg-card/80">
      <CardHeader className="space-y-3">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <Bell className="size-5" aria-hidden="true" />
          <span className="text-sm">{sponsorCopy.settings.notifications.title}</span>
        </div>
        <CardTitle className="text-2xl text-card-foreground">
          {sponsorCopy.settings.notifications.title}
        </CardTitle>
        <CardDescription>{sponsorCopy.settings.notifications.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={submitHandler} noValidate>
          <section className="space-y-3 rounded-xl border border-border/70 bg-background/60 p-4 dark:border-border/80 dark:bg-background/40">
            <h3 className="text-sm font-medium text-foreground">
              {sponsorCopy.settings.notifications.emailSectionTitle}
            </h3>
            <p className="text-sm text-muted-foreground">
              {sponsorCopy.settings.notifications.emailSectionDescription}
            </p>

            {toggleItems.map((item) => (
              <Controller
                key={item.name}
                name={item.name}
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-card/70 p-3 dark:border-border/80 dark:bg-card/60">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ToggleControl
                      id={`toggle-${item.name}`}
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                )}
              />
            ))}
          </section>

          {submitError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:bg-destructive/15">
              {submitError}
            </p>
          ) : null}

          {submitSuccess ? (
            <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary dark:bg-primary/15">
              {submitSuccess}
            </p>
          ) : null}

          <Button type="submit" className="h-11 w-full md:w-auto" disabled={isSaving}>
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {sponsorCopy.settings.notifications.submittingLabel}
              </span>
            ) : (
              sponsorCopy.settings.notifications.submitLabel
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
