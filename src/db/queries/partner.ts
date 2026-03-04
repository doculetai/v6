import { and, count, eq, isNull } from 'drizzle-orm';

import type { DrizzleDB } from '../index';
import { partnerApiKeys } from '../schema';

export interface PartnerAnalyticsDailyCall {
  date: string;
  calls: number;
}

export interface PartnerAnalyticsUsageRow {
  id: string;
  endpoint: string;
  calls: number;
  successRate: string;
  avgLatency: string;
}

export type PartnerAnalyticsEventTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

export interface PartnerAnalyticsEvent {
  id: string;
  title: string;
  description: string | undefined;
  timestamp: string;
  tone: PartnerAnalyticsEventTone;
}

export interface PartnerAnalyticsData {
  stats: {
    totalVerifications: number;
    certificatesIssued: number;
    activeApiKeys: number;
    apiCallsThisMonth: number;
  };
  dailyCalls: PartnerAnalyticsDailyCall[];
  usageRows: PartnerAnalyticsUsageRow[];
  recentEvents: PartnerAnalyticsEvent[];
}

function buildLast30Days(): PartnerAnalyticsDailyCall[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return { date: d.toISOString().slice(0, 10), calls: 0 };
  });
}

export async function getPartnerAnalytics(
  db: DrizzleDB,
  partnerId: string,
): Promise<PartnerAnalyticsData> {
  const [activeKeysResult] = await db
    .select({ value: count() })
    .from(partnerApiKeys)
    .where(and(eq(partnerApiKeys.partnerId, partnerId), isNull(partnerApiKeys.revokedAt)));

  return {
    stats: {
      // totalVerifications and certificatesIssued require a partner<->student
      // linkage not yet in the schema — will be 0 until that FK is added.
      totalVerifications: 0,
      certificatesIssued: 0,
      activeApiKeys: activeKeysResult?.value ?? 0,
      apiCallsThisMonth: 0,
    },
    dailyCalls: buildLast30Days(),
    // usageRows require an API call log table — empty until instrumented.
    usageRows: [],
    // recentEvents require a partner_id FK on webhook_events — empty until added.
    recentEvents: [],
  };
}
