/**
 * E2E DB state helper — university state seeder.
 * Requires DATABASE_URL + E2E_UNIVERSITY_SCHOOL_ID.
 * The school is already created by auth seed; this controls programs attached to it.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../../src/db/schema';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const { programs } = schema;

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(client, { schema });
  return { db, client };
}

export interface UniversityState {
  /** Whether programs exist for this school */
  hasPrograms: boolean;
}

export async function setUniversityState(
  schoolId: string,
  state: UniversityState,
): Promise<void> {
  const { db, client } = createDb();

  try {
    // Remove all E2E programs for this school
    await db.delete(programs).where(eq(programs.schoolId, schoolId));

    if (state.hasPrograms) {
      await db.insert(programs).values([
        {
          schoolId,
          name: 'Computer Science',
          tuitionAmount: 1_500_000,
          currency: 'NGN',
          durationMonths: 48,
          status: 'active',
        },
        {
          schoolId,
          name: 'Business Administration',
          tuitionAmount: 1_200_000,
          currency: 'NGN',
          durationMonths: 24,
          status: 'active',
        },
      ]);
    }
  } finally {
    await client.end();
  }
}
