/**
 * E2E DB state helper — agent state seeder.
 * Requires DATABASE_URL + E2E_AGENT_USER_ID + E2E_STUDENT_USER_ID.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../../src/db/schema';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const { agentStudentAssignments, agentCommissions } = schema;

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(client, { schema });
  return { db, client };
}

export interface AgentState {
  /** Whether the agent has at least one student assigned */
  hasAssignedStudent: boolean;
  /** Whether the agent has a pending commission entry */
  hasPendingCommission: boolean;
}

export async function setAgentState(
  agentId: string,
  studentId: string,
  state: AgentState,
): Promise<void> {
  const { db, client } = createDb();

  try {
    // Clear existing assignments and commissions for this agent
    await db
      .delete(agentCommissions)
      .where(eq(agentCommissions.agentId, agentId));
    await db
      .delete(agentStudentAssignments)
      .where(eq(agentStudentAssignments.agentId, agentId));

    if (state.hasAssignedStudent) {
      await db.insert(agentStudentAssignments).values({
        agentId,
        studentId,
      });
    }

    if (state.hasPendingCommission) {
      await db.insert(agentCommissions).values({
        agentId,
        sponsorshipId: null,
        amountKobo: 15_000_00, // ₦15,000
        currency: 'NGN',
        status: 'pending',
        description: 'E2E test commission',
      });
    }
  } finally {
    await client.end();
  }
}
