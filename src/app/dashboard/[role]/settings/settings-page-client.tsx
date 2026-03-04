'use client';

import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/ui/page-header';
import { SessionManagement } from '@/components/ui/session-management';
import type { Session } from '@/components/ui/session-management';
import { SurfacePanel } from '@/components/ui/surface-panel';
import { UniversityNotificationsSection } from '@/components/university/UniversityNotificationsSection';
import { UniversityProfileSection } from '@/components/university/UniversityProfileSection';
import { UniversityWebhookSection } from '@/components/university/UniversityWebhookSection';
import { universityCopy } from '@/config/copy/university';
import { trpc } from '@/trpc/client';

interface SessionInfo {
  id: string;
  email: string | null;
  lastSignedInAt: string | null;
}

interface ProfileData {
  institutionName: string;
  accreditationBody: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  webhookUrl: string | null;
  notifyOnSubmission: boolean;
  notifyOnApproval: boolean;
  notifyOnRejection: boolean;
}

interface SettingsPageClientProps {
  profile: ProfileData;
  session: SessionInfo;
}

function buildSession(info: SessionInfo): Session {
  const lastActive = info.lastSignedInAt
    ? new Intl.DateTimeFormat('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Africa/Lagos',
      }).format(new Date(info.lastSignedInAt))
    : 'Unknown';

  return {
    id: info.id,
    browser: 'Unknown',
    deviceType: 'unknown',
    location: 'Unknown location',
    lastActive,
    isCurrent: true,
    ipAddress: undefined,
  };
}

export function SettingsPageClient({ profile, session }: SettingsPageClientProps) {
  const copy = universityCopy.settings;
  const router = useRouter();

  const revokeMutation = trpc.university.revokeAllSessions.useMutation({
    onSuccess: () => {
      router.push('/login');
    },
  });

  const sessions: Session[] = [buildSession(session)];

  return (
    <div className="space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      {/* Institution profile */}
      <UniversityProfileSection
        defaultValues={{
          institutionName: profile.institutionName,
          accreditationBody: profile.accreditationBody,
          contactEmail: profile.contactEmail,
          contactPhone: profile.contactPhone,
        }}
      />

      {/* Email notifications */}
      <UniversityNotificationsSection
        defaultValues={{
          notifyOnSubmission: profile.notifyOnSubmission,
          notifyOnApproval: profile.notifyOnApproval,
          notifyOnRejection: profile.notifyOnRejection,
        }}
      />

      {/* Webhook integration */}
      <UniversityWebhookSection
        defaultValues={{
          webhookUrl: profile.webhookUrl,
        }}
      />

      {/* Active sessions */}
      <section aria-labelledby="sessions-heading">
        <SurfacePanel variant="default" density="comfortable" className="space-y-4">
          <div className="space-y-1 border-b border-border pb-4">
            <h2 id="sessions-heading" className="text-base font-semibold text-foreground">
              {copy.sessions.sectionTitle}
            </h2>
            <p className="text-sm text-muted-foreground">{copy.sessions.sectionSubtitle}</p>
          </div>

          {revokeMutation.error ? (
            <p className="text-xs text-destructive" role="alert">
              {copy.errors.sessionRevoke}
            </p>
          ) : null}

          <SessionManagement
            sessions={sessions}
            showIpAddress={false}
            onRevokeAll={() => revokeMutation.mutate()}
          />
        </SurfacePanel>
      </section>
    </div>
  );
}
