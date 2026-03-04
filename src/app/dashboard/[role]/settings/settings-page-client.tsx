'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { SponsorNotificationSettings } from '@/components/sponsor/SponsorNotificationSettings';
import { SponsorProfileForm } from '@/components/sponsor/SponsorProfileForm';
import { SponsorSessionPanel } from '@/components/sponsor/SponsorSessionPanel';
import { FormSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sponsorCopy } from '@/config/copy/sponsor';
import {
  sponsorNotificationSettingsSchema,
  sponsorProfileInputSchema,
  type SponsorNotificationSettings as SponsorNotificationSettingsValues,
  type SponsorProfile,
  type SponsorProfileInput,
} from '@/server/routers/sponsor.schemas';
import { browserTrpcClient } from '@/trpc/client';

function defaultProfileValues(): SponsorProfileInput {
  return {
    fullName: '',
    email: '',
    phoneNumber: '+234',
    relationshipToStudent: 'parent',
    sponsorType: 'individual',
    companyName: '',
    cacNumber: '',
    directorBvn: '',
  };
}

function mapProfileToFormValues(profile: SponsorProfile): SponsorProfileInput {
  return {
    fullName: profile.fullName,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
    relationshipToStudent: profile.relationshipToStudent,
    sponsorType: profile.sponsorType,
    companyName: profile.companyName ?? '',
    cacNumber: profile.cacNumber ?? '',
    directorBvn: profile.directorBvn ?? '',
  };
}

export function SettingsPageClient() {
  const [profile, setProfile] = useState<SponsorProfile | null>(null);
  const [notificationSettings, setNotificationSettings] =
    useState<SponsorNotificationSettingsValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSubmitError, setProfileSubmitError] = useState<string | null>(null);
  const [profileSubmitSuccess, setProfileSubmitSuccess] = useState<string | null>(null);

  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationSubmitError, setNotificationSubmitError] = useState<string | null>(null);
  const [notificationSubmitSuccess, setNotificationSubmitSuccess] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [profileResponse, notificationsResponse] = await Promise.all([
        browserTrpcClient.sponsor.getProfile.query(),
        browserTrpcClient.sponsor.getNotificationSettings.query(),
      ]);

      setProfile(profileResponse);
      setNotificationSettings(notificationsResponse);
    } catch {
      setLoadError(sponsorCopy.settings.states.errorDescription);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleProfileSubmit = useCallback(async (values: SponsorProfileInput) => {
    setIsSavingProfile(true);
    setProfileSubmitError(null);
    setProfileSubmitSuccess(null);

    try {
      const payload = sponsorProfileInputSchema.parse(values);
      const updatedProfile = await browserTrpcClient.sponsor.updateProfile.mutate(payload);
      setProfile(updatedProfile);
      setProfileSubmitSuccess(sponsorCopy.settings.profile.successMessage);
    } catch (error) {
      const fallbackMessage = sponsorCopy.settings.profile.errorMessage;
      setProfileSubmitError(error instanceof Error ? error.message : fallbackMessage);
    } finally {
      setIsSavingProfile(false);
    }
  }, []);

  const handleNotificationSubmit = useCallback(
    async (values: SponsorNotificationSettingsValues) => {
      setIsSavingNotifications(true);
      setNotificationSubmitError(null);
      setNotificationSubmitSuccess(null);

      try {
        const payload = sponsorNotificationSettingsSchema.parse(values);
        const updatedSettings =
          await browserTrpcClient.sponsor.updateNotificationSettings.mutate(payload);
        setNotificationSettings(updatedSettings);
        setNotificationSubmitSuccess(sponsorCopy.settings.notifications.successMessage);
      } catch {
        setNotificationSubmitError(sponsorCopy.settings.notifications.errorMessage);
      } finally {
        setIsSavingNotifications(false);
      }
    },
    [],
  );

  const profileFormValues = useMemo(
    () => (profile ? mapProfileToFormValues(profile) : defaultProfileValues()),
    [profile],
  );

  const notificationValues = useMemo(
    () =>
      notificationSettings ?? {
        emailFundingUpdates: true,
        emailVerificationUpdates: true,
        emailSecurityAlerts: true,
      },
    [notificationSettings],
  );

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <FormSkeleton fields={7} />
        <div className="space-y-6">
          <FormSkeleton fields={4} />
          <FormSkeleton fields={3} />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <Card className="border-destructive/40 bg-card/90 dark:bg-card/80">
        <CardHeader className="space-y-3">
          <div className="inline-flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" aria-hidden="true" />
            <span className="text-sm">{sponsorCopy.settings.states.errorTitle}</span>
          </div>
          <CardTitle className="text-2xl text-card-foreground">
            {sponsorCopy.settings.states.errorTitle}
          </CardTitle>
          <CardDescription>{loadError}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => void loadSettings()} className="h-11">
            <span className="inline-flex items-center gap-2">
              <RefreshCw className="size-4" aria-hidden="true" />
              {sponsorCopy.settings.states.retryLabel}
            </span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile || !notificationSettings) {
    return (
      <Card className="border-border/70 bg-card/90 dark:bg-card/80">
        <CardHeader>
          <CardTitle className="text-2xl text-card-foreground">
            {sponsorCopy.settings.states.emptyTitle}
          </CardTitle>
          <CardDescription>{sponsorCopy.settings.states.emptyDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" className="h-11" onClick={() => void loadSettings()}>
            {sponsorCopy.settings.states.restoreDefaultsLabel}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SponsorProfileForm
        initialValues={profileFormValues}
        onSubmit={handleProfileSubmit}
        isSaving={isSavingProfile}
        submitError={profileSubmitError}
        submitSuccess={profileSubmitSuccess}
      />

      <div className="space-y-6">
        <SponsorNotificationSettings
          initialValues={notificationValues}
          onSubmit={handleNotificationSubmit}
          isSaving={isSavingNotifications}
          submitError={notificationSubmitError}
          submitSuccess={notificationSubmitSuccess}
        />

        <SponsorSessionPanel
          sessions={profile.sessions.map((session) => ({
            ...session,
            ipAddress: session.ipAddress ?? undefined,
          }))}
          lastLoginLocation={profile.lastLoginLocation}
          hasSuspiciousLogin={profile.hasSuspiciousLogin}
        />
      </div>
    </div>
  );
}
