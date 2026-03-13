/**
 * E2E DB state helper — admin view state.
 * Admin state is derived from student data visible in the queue.
 * Requires DATABASE_URL + E2E_STUDENT_USER_ID.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../../src/db/schema';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const { documents, pipelineRuns } = schema;

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(client, { schema });
  return { db, client };
}

export interface AdminViewState {
  /** Whether a student document is pending review in the queue */
  queueHasItem: boolean;
  /** Whether the pending doc has an OCR pipeline run (shows richer queue row) */
  queueItemHasOcr?: boolean;
}

/**
 * Seeds state visible to admin on the Operations page.
 * @param studentId  E2E student user ID whose docs feed the queue.
 */
export async function setAdminViewState(
  studentId: string,
  state: AdminViewState,
): Promise<void> {
  const { db, client } = createDb();

  try {
    // Clear student docs + OCR runs so admin queue is predictable
    await db.delete(pipelineRuns).where(eq(pipelineRuns.userId, studentId));
    await db.delete(documents).where(eq(documents.userId, studentId));

    if (state.queueHasItem) {
      const [doc] = await db
        .insert(documents)
        .values({
          userId: studentId,
          type: 'bank_statement',
          storageUrl: 'https://placeholder.doculet.ai/e2e/statement.pdf',
          status: 'pending',
          rejectionReason: null,
          reviewedAt: null,
        })
        .returning({ id: documents.id });

      if (state.queueItemHasOcr) {
        await db.insert(pipelineRuns).values({
          documentId: doc.id,
          userId: studentId,
          status: 'completed',
          progress: 100,
          bankName: 'Access Bank',
          accountHolder: 'E2E Student',
          compositeScore: 82,
          riskCategory: 'low',
          autoDecision: 'review',
          consensusResult: {
            extractedName: 'E2E Student',
            extractedBalance: 2000000,
            accountNumber: '0987654321',
            bankName: 'Access Bank',
          },
        });
      }
    }
  } finally {
    await client.end();
  }
}
