'use client';

import { Container, Stack } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/ui/page-header';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { AccountClosureCard } from '@/components/settings/AccountClosureCard';
import { MFASettingsCard } from '@/components/settings/MFASettingsCard';
import { NotificationPreferencesCard } from '@/components/settings/NotificationPreferencesCard';
import { PasswordChangeCard } from '@/components/settings/PasswordChangeCard';
import { ProfileEditCard } from '@/components/settings/ProfileEditCard';
import { SessionManagementWithData } from '@/components/settings/SessionManagementWithData';
import { studentCopy } from '@/config/copy/student';

import type { StudentSettings } from './student-settings-forms';
import { ChangeSchoolCard, SponsorInvitesCard } from './student-settings-forms';

type Props = {
  settings: StudentSettings | null;
};

export function StudentSettingsPageClient({ settings }: Props) {
  const breadcrumbs = useDashboardBreadcrumbs(studentCopy.settings.title);
  return (
    <Container width="md">
      <Stack gap="md">
        <PageHeader
          title={studentCopy.settings.title}
          subtitle={studentCopy.settings.subtitle}
          breadcrumbs={breadcrumbs}
        />
        {settings && (
          <>
            <ChangeSchoolCard settings={settings} />
            <SponsorInvitesCard />
          </>
        )}
        <ProfileEditCard />
        <PasswordChangeCard />
        <NotificationPreferencesCard />
        <MFASettingsCard />
        <AccountClosureCard />
        <SessionManagementWithData />
      </Stack>
    </Container>
  );
}
