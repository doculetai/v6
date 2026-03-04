import type { PartnerAnalyticsData } from '@/db/queries/partner';

/** Generates a 30-day date array starting from a fixed base date for deterministic tests. */
function buildTestDailyCalls(baseDate = '2026-02-02'): PartnerAnalyticsData['dailyCalls'] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    return { date: d.toISOString().slice(0, 10), calls: 0 };
  });
}

export const partnerAnalyticsEmptyFixture: PartnerAnalyticsData = {
  stats: {
    totalVerifications: 0,
    certificatesIssued: 0,
    activeApiKeys: 0,
    apiCallsThisMonth: 0,
  },
  dailyCalls: buildTestDailyCalls(),
  usageRows: [],
  recentEvents: [],
};

export const partnerAnalyticsWithDataFixture: PartnerAnalyticsData = {
  stats: {
    totalVerifications: 0,
    certificatesIssued: 0,
    activeApiKeys: 3,
    apiCallsThisMonth: 0,
  },
  dailyCalls: buildTestDailyCalls(),
  usageRows: [],
  recentEvents: [
    {
      id: 'evt-001',
      title: 'paystack: charge.success',
      description: undefined,
      timestamp: '2026-03-04T09:00:00.000Z',
      tone: 'success',
    },
    {
      id: 'evt-002',
      title: 'mono: account.updated',
      description: undefined,
      timestamp: '2026-03-03T14:30:00.000Z',
      tone: 'neutral',
    },
    {
      id: 'evt-003',
      title: 'dojah: identity.failed',
      description: undefined,
      timestamp: '2026-03-02T11:15:00.000Z',
      tone: 'error',
    },
  ],
};
