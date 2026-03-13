/**
 * E2E DB state helper — partner state seeder.
 * Requires DATABASE_URL + E2E_PARTNER_PROFILE_ID + E2E_STUDENT_USER_ID.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../../src/db/schema';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const { partnerApiKeys, partnerStudents, apiUsage } = schema;

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(client, { schema });
  return { db, client };
}

export interface PartnerState {
  /** Whether the partner has active API keys */
  hasApiKeys: boolean;
  /** Whether the partner has verified students */
  hasStudents: boolean;
  /**
   * When true (requires hasApiKeys): seeds api_usage rows for today so the
   * partner's analytics page shows actual call counts (configure_integration
   * complete state per partner journey model).
   */
  hasApiUsage?: boolean;
}

export async function setPartnerState(
  partnerProfileId: string,
  studentId: string,
  state: PartnerState,
): Promise<void> {
  const { db, client } = createDb();

  try {
    // Clear existing API keys and partner students
    await db
      .delete(partnerStudents)
      .where(eq(partnerStudents.partnerId, partnerProfileId));
    await db
      .delete(partnerApiKeys)
      .where(eq(partnerApiKeys.partnerId, partnerProfileId));

    if (state.hasApiKeys) {
      await db.insert(partnerApiKeys).values({
        partnerId: partnerProfileId,
        keyHash: `e2e_hash_${crypto.randomUUID()}`,
        keyPrefix: 'dk_live_e2e',
        scopes: ['students:read', 'certificates:read'],
        environment: 'production',
      });
    }

    if (state.hasStudents) {
      await db.insert(partnerStudents).values({
        partnerId: partnerProfileId,
        studentId,
        tier: 3,
        verifiedAt: new Date(),
      });
    }

    // Clear prior api_usage for this partner
    await db.delete(apiUsage).where(eq(apiUsage.partnerId, partnerProfileId));

    if (state.hasApiUsage && state.hasApiKeys) {
      // Insert daily usage for today — partner analytics page shows call counts
      const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
      await db.insert(apiUsage).values([
        {
          partnerId: partnerProfileId,
          endpoint: '/v1/students',
          period: today,
          requestCount: 47,
        },
        {
          partnerId: partnerProfileId,
          endpoint: '/v1/certificates/verify',
          period: today,
          requestCount: 12,
        },
      ]);
    }
  } finally {
    await client.end();
  }
}
