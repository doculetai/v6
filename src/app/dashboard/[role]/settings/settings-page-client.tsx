'use client';

import { PageHeader } from '@/components/ui/page-header';
import { SessionManagement } from '@/components/ui/session-management';
import type { Session } from '@/components/ui/session-management';
import { agentCopy } from '@/config/copy/agent';
import { sponsorCopy } from '@/config/copy/sponsor';

import {
  AgentNotificationPreferencesForm,
  AgentProfileSettingsForm,
} from './agent-settings-forms';
import { SponsorNotificationsCard, SponsorProfileSettingsForm } from './sponsor-settings-forms';

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

// ── Main component ────────────────────────────────────────────────────────────

export function SettingsPageClient(props: Props) {
  if (props.role === 'sponsor') {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader
          title={sponsorCopy.settings.title}
          subtitle={sponsorCopy.settings.subtitle}
        />
        <SponsorProfileSettingsForm settings={props.settings} />
        <SponsorNotificationsCard />
        <SessionManagement sessions={PLACEHOLDER_SESSIONS} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        title={agentCopy.settings.title}
        subtitle={agentCopy.settings.subtitle}
      />
      <AgentProfileSettingsForm settings={props.settings} />
      <AgentNotificationPreferencesForm settings={props.settings} />
      <SessionManagement sessions={PLACEHOLDER_SESSIONS} />
    </div>
  );
}
