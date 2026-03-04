'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { SessionManagement } from '@/components/ui/session-management';
import type { Session } from '@/components/ui/session-management';
import { Switch } from '@/components/ui/switch';
import { agentCopy } from '@/config/copy/agent';
import { sponsorCopy } from '@/config/copy/sponsor';
import { browserTrpcClient } from '@/trpc/client';

// ── Types (exported so page.tsx can import without duplication) ───────────────

export type AgentSettings = {
  fullName: string | null;
  phoneNumber: string | null;
  region: string | null;
  accreditationNumber: string | null;
  notifyNewStudent: boolean;
  notifyCommissionPaid: boolean;
  notifyStudentMilestone: boolean;
  notifyAccountSecurity: boolean;
};

export type SponsorSettings = {
  sponsorType: 'individual' | 'corporate' | 'self' | null;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  companyName: string | null;
};

type Props =
  | { role: 'agent'; settings: AgentSettings }
  | { role: 'sponsor'; settings: SponsorSettings };

// ── Copy aliases ─────────────────────────────────────────────────────────────

const agentSettingsCopy = agentCopy.settings;
const sponsorSettingsCopy = sponsorCopy.settings;

// ── Zod schemas ──────────────────────────────────────────────────────────────

const agentProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, agentSettingsCopy.validation.fullNameRequired)
    .max(120, agentSettingsCopy.validation.fullNameMax),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+234\d{10}$/.test(val),
      agentSettingsCopy.validation.phoneInvalid,
    ),
  region: z.string().max(100).optional(),
  accreditationNumber: z.string().min(1, agentSettingsCopy.validation.accreditationRequired),
});

const agentNotificationsSchema = z.object({
  notifyNewStudent: z.boolean(),
  notifyCommissionPaid: z.boolean(),
  notifyStudentMilestone: z.boolean(),
  notifyAccountSecurity: z.boolean(),
});

const sponsorProfileSchema = z.object({
  sponsorType: z.enum(['individual', 'corporate', 'self']),
  companyName: z.string().max(120).optional(),
});

type AgentProfileFormValues = z.infer<typeof agentProfileSchema>;
type AgentNotificationsFormValues = z.infer<typeof agentNotificationsSchema>;
type SponsorProfileFormValues = z.infer<typeof sponsorProfileSchema>;

// ── Static session placeholder ───────────────────────────────────────────────

const PLACEHOLDER_SESSIONS: Session[] = [
  {
    id: 'current-session',
    browser: 'Chrome',
    deviceType: 'desktop',
    location: 'Lagos, Nigeria',
    lastActive: 'Active now',
    isCurrent: true,
  },
];

// ── Shared feedback helpers ───────────────────────────────────────────────────

function FormErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:border-destructive/40 dark:bg-destructive/15"
    >
      {message}
    </p>
  );
}

function FormSuccessBanner({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="flex items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
    >
      <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

// ── AgentProfileSettingsForm ──────────────────────────────────────────────────

function AgentProfileSettingsForm({ settings }: { settings: AgentSettings }) {
  const copy = agentSettingsCopy;
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

function AgentNotificationPreferencesForm({ settings }: { settings: AgentSettings }) {
  const copy = agentSettingsCopy;
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

// ── SponsorProfileSettingsForm ────────────────────────────────────────────────

function SponsorProfileSettingsForm({ settings }: { settings: SponsorSettings }) {
  const copy = sponsorSettingsCopy;
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

  const kycLabel = {
    not_started: 'Not verified',
    pending: 'In progress',
    verified: 'Verified',
    failed: 'Failed',
  }[settings.kycStatus];

  const kycBadgeClass = {
    not_started: 'bg-muted text-muted-foreground',
    pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    verified: 'bg-green-500/10 text-green-700 dark:text-green-400',
    failed: 'bg-destructive/10 text-destructive',
  }[settings.kycStatus];

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
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${kycBadgeClass}`}
            >
              {kycLabel}
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

function SponsorNotificationsCard() {
  const copy = sponsorSettingsCopy;

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

// ── Main component ────────────────────────────────────────────────────────────

export function SettingsPageClient(props: Props) {
  if (props.role === 'sponsor') {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader
          title={sponsorSettingsCopy.title}
          subtitle={sponsorSettingsCopy.subtitle}
        />
        <SponsorProfileSettingsForm settings={props.settings} />
        <SponsorNotificationsCard />
        <SessionManagement sessions={PLACEHOLDER_SESSIONS} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader title={agentSettingsCopy.title} subtitle={agentSettingsCopy.subtitle} />
      <AgentProfileSettingsForm settings={props.settings} />
      <AgentNotificationPreferencesForm settings={props.settings} />
      <SessionManagement sessions={PLACEHOLDER_SESSIONS} />
    </div>
  );
}
