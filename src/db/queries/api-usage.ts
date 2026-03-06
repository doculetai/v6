import { sql } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { apiUsage } from '@/db/schema';

const DEFAULT_DAILY_LIMIT = 10_000;

function getDailyPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export async function checkAndIncrementUsage(
  db: DrizzleDB,
  params: {
    partnerId: string;
    keyId: string | null;
    endpoint: string;
    limit?: number;
  },
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const period = getDailyPeriod();
  const limit = params.limit ?? DEFAULT_DAILY_LIMIT;

  const [row] = await db
    .insert(apiUsage)
    .values({
      partnerId: params.partnerId,
      keyId: params.keyId,
      endpoint: params.endpoint,
      period,
      requestCount: 1,
    })
    .onConflictDoUpdate({
      target: [apiUsage.partnerId, apiUsage.keyId, apiUsage.endpoint, apiUsage.period],
      set: {
        requestCount: sql`${apiUsage.requestCount} + 1`,
        updatedAt: new Date(),
      },
    })
    .returning({ requestCount: apiUsage.requestCount });

  const current = row?.requestCount ?? 1;
  return { allowed: current <= limit, current, limit };
}
