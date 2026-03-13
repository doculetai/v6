/**
 * E2E DB state helper — sponsor state seeder.
 * Requires DATABASE_URL + E2E_SPONSOR_USER_ID + E2E_STUDENT_USER_ID.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../../src/db/schema';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const { sponsorships } = schema;

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(client, { schema });
  return { db, client };
}

export interface SponsorState {
  /** Whether the sponsor has an active commitment to the E2E student */
  hasCommitment: boolean;
  commitmentStatus?: 'pending' | 'active' | 'completed';
}

export async function setSponsorState(
  sponsorId: string,
  studentId: string,
  state: SponsorState,
): Promise<void> {
  const { db, client } = createDb();

  try {
    // Clear all sponsorships from this sponsor to the E2E student
    await db
      .delete(sponsorships)
      .where(eq(sponsorships.sponsorId, sponsorId));

    if (state.hasCommitment) {
      await db.insert(sponsorships).values({
        studentId,
        sponsorId,
        status: state.commitmentStatus ?? 'active',
        amountKobo: 1_500_000_00, // ₦1,500,000
        currency: 'NGN',
        relationship: 'Family sponsor',
        balanceCheckStatus: 'unchecked',
      });
    }
  } finally {
    await client.end();
  }
}
