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

const { agentStudentAssignments, agentCommissions, documents, certificates } = schema;

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
  /**
   * When true (requires hasAssignedStudent): seeds a rejected document for
   * the student so the agent's overview shows the "needs attention" banner.
   */
  studentHasRejectedDoc?: boolean;
  /**
   * When true (requires hasAssignedStudent): seeds a certificate for the
   * student so the agent's overview shows the "mature portfolio" state.
   */
  studentCertIssued?: boolean;
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

    // Clear student docs and certs set by prior runs
    await db.delete(certificates).where(eq(certificates.studentId, studentId));
    await db.delete(documents).where(eq(documents.userId, studentId));

    if (state.studentHasRejectedDoc) {
      await db.insert(documents).values({
        userId: studentId,
        type: 'bank_statement',
        storageUrl: 'https://placeholder.doculet.ai/e2e/statement.pdf',
        status: 'rejected',
        rejectionReason: 'Balance below required minimum. Resubmit with correct statement.',
        reviewedAt: new Date(),
      });
    }

    if (state.studentCertIssued) {
      await db.insert(certificates).values({
        studentId,
        token: `e2e_agent_cert_${crypto.randomUUID()}`,
        certCode: `E2E-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        status: 'active',
        paymentStatus: 'paid',
        issuedAt: new Date(),
        metaJson: {
          studentName: 'E2E Student',
          schoolName: 'Test University',
          programName: 'Computer Science',
          amount: 1500000,
          currency: 'NGN',
        },
      });
    }
  } finally {
    await client.end();
  }
}
