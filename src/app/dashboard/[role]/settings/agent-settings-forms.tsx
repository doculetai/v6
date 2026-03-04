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
import { agentCopy } from '@/config/copy/agent';
import { browserTrpcClient } from '@/trpc/client';

import { FormErrorBanner, FormSuccessBanner } from './settings-shared';
import type { AgentSettings } from './settings-page-client';

const copy = agentCopy.settings;

// ── Zod schemas ──────────────────────────────────────────────────────────────

const agentProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, copy.validation.fullNameRequired)
    .max(120, copy.validation.fullNameMax),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+234\d{10}$/.test(val),
      copy.validation.phoneInvalid,
    ),
  region: z.string().max(100).optional(),
  accreditationNumber: z.string().min(1, copy.validation.accreditationRequired),
});

const agentNotificationsSchema = z.object({
  notifyNewStudent: z.boolean(),
  notifyCommissionPaid: z.boolean(),
  notifyStudentMilestone: z.boolean(),
  notifyAccountSecurity: z.boolean(),
});

type AgentProfileFormValues = z.infer<typeof agentProfileSchema>;
type AgentNotificationsFormValues = z.infer<typeof agentNotificationsSchema>;

// ── AgentProfileSettingsForm ──────────────────────────────────────────────────

export function AgentProfileSettingsForm({ settings }: { settings: AgentSettings }) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AgentProfileFormValues>({
    resolver: zodResolver(agentProfileSchema),
    defaultValues: {
      fullName: settings.fullName ?? '',
      phoneNumber: settings.phoneNumber ?? '',
      region: settings.region ?? '',
      accreditationNumber: settings.accreditationNumber ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSaved(false);

    try {
      await browserTrpcClient.agent.updateProfile.mutate({
        fullName: values.fullName,
        phoneNumber: values.phoneNumber || undefined,
        region: values.region || undefined,
        accreditationNumber: values.accreditationNumber,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch {
      setSubmitError(copy.errors.profileSaveError);
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
          <div className="space-y-2">
            <Label htmlFor="agent-full-name">{copy.profile.fullNameLabel}</Label>
            <Input
              id="agent-full-name"
              type="text"
              autoComplete="name"
              placeholder={copy.profile.fullNamePlaceholder}
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? 'agent-full-name-error' : undefined}
              {...register('fullName')}
            />
            {errors.fullName?.message ? (
              <p id="agent-full-name-error" className="text-sm text-destructive">
                {errors.fullName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-phone">{copy.profile.phoneLabel}</Label>
            <Input
              id="agent-phone"
              type="tel"
              autoComplete="tel"
              placeholder={copy.profile.phonePlaceholder}
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.phoneNumber)}
              aria-describedby={errors.phoneNumber ? 'agent-phone-error' : undefined}
              {...register('phoneNumber')}
            />
            {errors.phoneNumber?.message ? (
              <p id="agent-phone-error" className="text-sm text-destructive">
                {errors.phoneNumber.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-region">{copy.profile.regionLabel}</Label>
            <Input
              id="agent-region"
              type="text"
              placeholder={copy.profile.regionPlaceholder}
              className="h-11 bg-background"
              {...register('region')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-accreditation">{copy.profile.accreditationLabel}</Label>
            <Input
              id="agent-accreditation"
              type="text"
              placeholder={copy.profile.accreditationPlaceholder}
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.accreditationNumber)}
              aria-describedby={
                errors.accreditationNumber ? 'agent-accreditation-error' : undefined
              }
              {...register('accreditationNumber')}
            />
            {errors.accreditationNumber?.message ? (
              <p id="agent-accreditation-error" className="text-sm text-destructive">
                {errors.accreditationNumber.message}
              </p>
            ) : null}
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

// ── AgentNotificationPreferencesForm ─────────────────────────────────────────

export function AgentNotificationPreferencesForm({ settings }: { settings: AgentSettings }) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AgentNotificationsFormValues>({
    resolver: zodResolver(agentNotificationsSchema),
    defaultValues: {
      notifyNewStudent: settings.notifyNewStudent,
      notifyCommissionPaid: settings.notifyCommissionPaid,
      notifyStudentMilestone: settings.notifyStudentMilestone,
      notifyAccountSecurity: settings.notifyAccountSecurity,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSaved(false);

    try {
      await browserTrpcClient.agent.updateNotifications.mutate(values);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch {
      setSubmitError(copy.errors.notificationSaveError);
    }
  });

  const preferences = [
    {
      name: 'notifyNewStudent' as const,
      label: copy.notifications.newStudent,
      description: copy.notifications.newStudentDescription,
    },
    {
      name: 'notifyCommissionPaid' as const,
      label: copy.notifications.commissionPaid,
      description: copy.notifications.commissionPaidDescription,
    },
    {
      name: 'notifyStudentMilestone' as const,
      label: copy.notifications.studentMilestone,
      description: copy.notifications.studentMilestoneDescription,
    },
    {
      name: 'notifyAccountSecurity' as const,
      label: copy.notifications.accountSecurity,
      description: copy.notifications.accountSecurityDescription,
    },
  ];

  return (
    <Card className="border-border bg-card dark:border-border dark:bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-card-foreground">
          {copy.notifications.sectionTitle}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {copy.notifications.sectionDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="divide-y divide-border/60">
            {preferences.map((pref) => (
              <label
                key={pref.name}
                className="flex cursor-pointer items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 cursor-pointer rounded border-input accent-primary focus-visible:ring-2 focus-visible:ring-ring"
                  {...register(pref.name)}
                />
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground">{pref.label}</span>
                  <p className="text-xs text-muted-foreground">{pref.description}</p>
                </div>
              </label>
            ))}
          </div>

          {submitError ? <FormErrorBanner message={submitError} /> : null}
          {saved ? <FormSuccessBanner message={copy.notifications.savedLabel} /> : null}

          <div className="flex justify-end">
            <Button type="submit" className="min-h-11" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {copy.notifications.savingLabel}
                </span>
              ) : (
                copy.notifications.saveLabel
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
