/**
 * Bank statement OCR pipeline processor.
 * Fetches document from storage, runs OCR orchestrator, persists results.
 * Call fire-and-forget from document upload mutation.
 */

import type { DrizzleDB } from '@/db';
import { pipelineRunStatusValues } from '@/db/schema';
import {
  createPipelineRun,
  updatePipelineProgress,
  completePipelineRun,
} from '@/db/queries/pipeline-runs';
import { runPipeline } from './orchestrator';
import { claudeVisionProvider, googleVisionProvider } from './providers';
import type { OcrInput, PipelineResult } from './types';
import { runFraudChecksFromExtraction } from '../fraud/run-all-checks';

/**
 * Process a bank statement through the OCR pipeline.
 * Call without await — fire-and-forget from the upload mutation.
 * Uses Claude Vision as primary extractor and Google Vision as deep-scan fallback when configured.
 */
export function processBankStatementPipeline(
  db: DrizzleDB,
  documentId: string,
  userId: string,
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
): void {
  const runPipelineAsync = async () => {
    const { id: runId } = await createPipelineRun(db, { documentId, userId });

    const fileUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    const input: OcrInput = {
      fileUrl,
      mimeType,
      fileName,
    };

    const callbacks = {
      onProgress: async (event: { stage: string; progress: number; message: string }) => {
        await updatePipelineProgress(db, runId, {
          status: event.stage as (typeof pipelineRunStatusValues)[number],
          progress: event.progress,
          currentStep: event.message,
        });
      },
      onComplete: async (result: PipelineResult) => {
        await completePipelineRun(db, runId, result);
      },
      runFraudChecks: runFraudChecksFromExtraction,
    };

    await runPipeline(input, claudeVisionProvider, [claudeVisionProvider, googleVisionProvider], callbacks);
  };

  runPipelineAsync().catch((err) => {
    console.error('[OCR] Pipeline failed:', documentId, err);
  });
}
