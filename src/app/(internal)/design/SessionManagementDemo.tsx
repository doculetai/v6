'use client';

import { SessionManagement } from '@/components/ui/session-management';

const DEMO_SESSIONS = [
  {
    id: 'sess-1',
    browser: 'Chrome',
    deviceType: 'desktop' as const,
    location: 'Lagos, NG',
    lastActive: '2 minutes ago',
    isCurrent: true,
    ipAddress: '197.210.54.12',
  },
  {
    id: 'sess-2',
    browser: 'Safari',
    deviceType: 'mobile' as const,
    location: 'Abuja, NG',
    lastActive: '1 hour ago',
    isCurrent: false,
    ipAddress: '41.58.23.199',
  },
  {
    id: 'sess-3',
    browser: 'Firefox',
    deviceType: 'tablet' as const,
    location: 'Port Harcourt, NG',
    lastActive: '3 days ago',
    isCurrent: false,
  },
];

export function SessionManagementDemo() {
  return (
    <SessionManagement
      showIpAddress
      sessions={DEMO_SESSIONS}
      onRevoke={(id) => console.info('Revoke session', id)}
      onRevokeAll={() => console.info('Revoke all sessions')}
    />
  );
}
