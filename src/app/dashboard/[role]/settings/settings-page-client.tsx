'use client';

import { useState } from 'react';

import { Container, Stack } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { SessionManagement } from '@/components/ui/session-management';
import type { Session } from '@/components/ui/session-management';
import { agentCopy } from '@/config/copy/agent';
import { primitivesCopy } from '@/config/copy/primitives';
import { sponsorCopy } from '@/config/copy/sponsor';
import { universityCopy } from '@/config/copy/university';
import { browserTrpcClient, trpc } from '@/trpc/client';

import {
  AgentBankDetailsForm,
  AgentNotificationPreferencesForm,
  AgentProfileSettingsForm,
} from './agent-settings-forms';
import { AccountDeletionCard } from './settings-shared';
import { SponsorNotificationsCard, SponsorProfileSettingsForm } from './sponsor-settings-forms';
import { UniversityProfileSettingsForm } from './university-settings-form';

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

export type UniversityProfile = {
  schoolId: string | null;
  schoolName: string | null;
  organizationName: string | null;
};

type Props =
  | { role: 'agent'; settings: AgentSettings }
  | { role: 'sponsor'; settings: SponsorSettings }
  | { role: 'university'; profile: UniversityProfile | null };

// ── Session management wired to tRPC ─────────────────────────────────────────

const sessionCopy = primitivesCopy.sessionManagement;

function SessionSection() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: sessions,
    isLoading,
    refetch,
  } = trpc.sessions.list.useQuery(undefined, {
    staleTime: 30_000,
  });

  async function handleRevoke(sessionId: string) {
    setFeedback(null);
    setError(null);
    try {
      await browserTrpcClient.sessions.revoke.mutate({ sessionId });
      setFeedback(sessionCopy.revoked);
      void refetch();
    } catch {
      setError(sessionCopy.revokeFailed);
    }
  }

  async function handleRevokeAll() {
    setFeedback(null);
    setError(null);
    try {
      await browserTrpcClient.sessions.revokeAllOthers.mutate();
      setFeedback(sessionCopy.revokedAll);
      void refetch();
    } catch {
      setError(sessionCopy.revokeFailed);
    }
  }

  const sessionList: Session[] = sessions ?? [];

  return (
    <SessionManagement
      sessions={sessionList}
      isLoading={isLoading}
      error={error}
      feedback={feedback}
      onRevoke={handleRevoke}
      onRevokeAll={handleRevokeAll}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SettingsPageClient(props: Props) {
  if (props.role === 'university') {
    return (
      <Container width="md" noPadding>
        <Stack gap="md">
          <PageHeader
            title={universityCopy.settings.title}
            subtitle={universityCopy.settings.subtitle}
          />
          <UniversityProfileSettingsForm profile={props.profile} />
          <SessionSection />
          <AccountDeletionCard />
        </Stack>
      </Container>
    );
  }

  if (props.role === 'sponsor') {
    return (
      <Container width="md" noPadding>
        <Stack gap="md">
          <PageHeader
            title={sponsorCopy.settings.title}
            subtitle={sponsorCopy.settings.subtitle}
          />
          <SponsorProfileSettingsForm settings={props.settings} />
          <SponsorNotificationsCard />
          <SessionSection />
          <AccountDeletionCard />
        </Stack>
      </Container>
    );
  }

  return (
    <Container width="md" noPadding>
      <Stack gap="md">
        <PageHeader
          title={agentCopy.settings.title}
          subtitle={agentCopy.settings.subtitle}
        />
        <AgentProfileSettingsForm settings={props.settings} />
        <AgentBankDetailsForm />
        <AgentNotificationPreferencesForm settings={props.settings} />
        <SessionSection />
        <AccountDeletionCard />
      </Stack>
    </Container>
  );
}
