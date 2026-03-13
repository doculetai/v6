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

const { programs, studentProfiles } = schema;

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(client, { schema });
  return { db, client };
}

export interface UniversityState {
  /** Whether programs exist for this school */
  hasPrograms: boolean;
  /**
   * When true: links the E2E student to this school via studentProfiles.schoolId
   * so the university's Students page shows a roster row.
   * Requires studentId to be passed to setUniversityState.
   */
  hasStudents?: boolean;
}

export async function setUniversityState(
  schoolId: string,
  state: UniversityState,
  studentId?: string,
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

    if (state.hasStudents && studentId) {
      // Link the E2E student to this school so they appear on the university roster
      await db
        .update(studentProfiles)
        .set({ schoolId })
        .where(eq(studentProfiles.userId, studentId));
    } else if (studentId) {
      // Detach the student from this school so we get a clean state
      await db
        .update(studentProfiles)
        .set({ schoolId: null })
        .where(eq(studentProfiles.userId, studentId));
    }
  } finally {
    await client.end();
  }
}
