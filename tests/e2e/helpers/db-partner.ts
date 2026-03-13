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

const { partnerApiKeys, partnerStudents } = schema;

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
  } finally {
    await client.end();
  }
}
