import { and, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { apiUsage } from '@/db/schema';

function getDailyPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export type PartnerUsageRow = {
  endpoint: string;
  requestCount: number;
};

export async function getPartnerUsageToday(
  db: DrizzleDB,
  partnerId: string,
): Promise<{ total: number; byEndpoint: PartnerUsageRow[] }> {
  const period = getDailyPeriod();

  const rows = await db
    .select({
      endpoint: apiUsage.endpoint,
      requestCount: apiUsage.requestCount,
    })
    .from(apiUsage)
    .where(and(eq(apiUsage.partnerId, partnerId), eq(apiUsage.period, period)));

  const byEndpointMap = new Map<string, number>();
  let total = 0;
  for (const r of rows) {
    total += r.requestCount;
    byEndpointMap.set(r.endpoint, (byEndpointMap.get(r.endpoint) ?? 0) + r.requestCount);
  }

  const byEndpoint: PartnerUsageRow[] = Array.from(byEndpointMap.entries())
    .map(([endpoint, requestCount]) => ({ endpoint, requestCount }))
    .sort((a, b) => b.requestCount - a.requestCount);

  return { total, byEndpoint };
}
