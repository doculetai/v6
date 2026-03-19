import { desc, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { pipelineRuns, type pipelineRunStatusValues } from '@/db/schema';
import type { PipelineResult } from '@/lib/ocr/types';

export async function createPipelineRun(
  db: DrizzleDB,
  input: { documentId: string; userId: string },
) {
  const [run] = await db
    .insert(pipelineRuns)
    .values({
      documentId: input.documentId,
      userId: input.userId,
      status: 'pending',
      progress: 0,
    })
    .returning({ id: pipelineRuns.id });

  return run!;
}

export async function updatePipelineProgress(
  db: DrizzleDB,
  runId: string,
  update: {
    status: (typeof pipelineRunStatusValues)[number];
    progress: number;
    currentStep?: string;
  },
) {
  await db
    .update(pipelineRuns)
    .set({
      status: update.status,
      progress: update.progress,
      currentStep: update.currentStep ?? null,
      updatedAt: new Date(),
    })
    .where(eq(pipelineRuns.id, runId));
}

export async function completePipelineRun(
  db: DrizzleDB,
  runId: string,
  result: PipelineResult,
) {
  await db
    .update(pipelineRuns)
    .set({
      status: result.stage as (typeof pipelineRunStatusValues)[number],
      progress: result.progress,
      fastExtraction: result.fastExtraction ?? null,
      fastValidation: result.fastValidation ?? null,
      providerExtractions: result.providerExtractions ?? null,
      consensusResult: result.consensusFields ?? null,
      fraudChecks: result.fraudChecks ?? null,
      compositeScore: result.compositeScore ?? null,
      riskCategory: result.riskCategory ?? null,
      autoDecision: result.autoDecision ?? null,
      bankName: result.consensusFields?.bankName ?? null,
      accountHolder: result.consensusFields?.accountHolder ?? null,
      statementPeriodStart: result.consensusFields?.statementPeriod?.from
        ? safeParseDate(result.consensusFields.statementPeriod.from)
        : null,
      statementPeriodEnd: result.consensusFields?.statementPeriod?.to
        ? safeParseDate(result.consensusFields.statementPeriod.to)
        : null,
      errorMessage: result.error ?? null,
      updatedAt: new Date(),
    })
    .where(eq(pipelineRuns.id, runId));
}

export async function getPipelineRunByDocumentId(
  db: DrizzleDB,
  documentId: string,
) {
  return db.query.pipelineRuns.findFirst({
    where: eq(pipelineRuns.documentId, documentId),
    orderBy: [desc(pipelineRuns.createdAt)],
  });
}

export async function listPipelineRunsByUser(
  db: DrizzleDB,
  userId: string,
) {
  return db.query.pipelineRuns.findMany({
    where: eq(pipelineRuns.userId, userId),
    orderBy: [desc(pipelineRuns.createdAt)],
  });
}

function safeParseDate(value: string): Date | null {
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}
