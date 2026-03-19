/**
 * OCR Pipeline Orchestrator — coordinates the 2-pass extraction flow:
 *
 * Fast path:  intake → fast_ocr → fast_validation → fast_complete
 * Deep path:  deep_ocr (multi-provider) → consensus → deep_fraud → completed
 *
 * The orchestrator is a pure state machine. Side effects (DB writes,
 * provider calls) are injected via callbacks.
 */

import type { OcrProvider, OcrInput, OcrOutput, PipelineResult, PipelineEvent } from './types';
import type { FraudFlags, RiskScore } from '../fraud/types';
import { validateExtraction } from './validate-extraction';
import { analyzeConsensus } from '../fraud/consensus-engine';
import { calculateRiskScore } from '../fraud/risk-scorer';

export type OrchestratorCallbacks = {
  /** Persist pipeline state to DB. */
  onProgress: (event: PipelineEvent) => Promise<void>;
  /** Persist final result to DB. */
  onComplete: (result: PipelineResult) => Promise<void>;
  /** Run all fraud checks on the extracted data. */
  runFraudChecks: (extraction: OcrOutput) => Promise<FraudFlags>;
};

/** Run the OCR pipeline for a single document. */
export async function runPipeline(
  input: OcrInput,
  fastProvider: OcrProvider,
  deepProviders: OcrProvider[],
  callbacks: OrchestratorCallbacks,
): Promise<PipelineResult> {
  const emit = (stage: PipelineResult['stage'], progress: number, message: string) =>
    callbacks.onProgress({
      stage,
      progress,
      message,
      timestamp: new Date().toISOString(),
    });

  let result: PipelineResult = { stage: 'pending', progress: 0 };

  try {
    // ─── Stage 1: Intake ────────────────────────────
    await emit('intake', 5, 'Preparing document for processing');
    result = { ...result, stage: 'intake', progress: 5 };

    // ─── Stage 2: Fast OCR ──────────────────────────
    await emit('fast_ocr', 15, 'Running primary extraction');
    const fastOutput = await fastProvider.extract(input);
    result = { ...result, stage: 'fast_ocr', progress: 30, fastExtraction: fastOutput };

    // ─── Stage 3: Fast Validation ───────────────────
    await emit('fast_validation', 35, 'Validating extraction quality');
    const validation = validateExtraction(fastOutput);
    result = { ...result, stage: 'fast_validation', progress: 40, fastValidation: validation };

    // ─── Stage 4: Fast Complete (or continue to deep) ─
    if (validation.valid && !validation.needsDeepScan) {
      await emit('fast_complete', 60, 'Primary extraction validated');

      // Run fraud checks on fast result
      const fraudFlags = await callbacks.runFraudChecks(fastOutput);
      const riskScore = calculateRiskScore(fraudFlags);

      result = {
        ...result,
        stage: 'completed',
        progress: 100,
        consensusFields: fastOutput.fields,
        fraudChecks: fraudFlags as unknown as Record<string, unknown>,
        compositeScore: riskScore.score,
        riskCategory: riskScore.category,
        autoDecision: riskScore.decision,
      };

      await emit('completed', 100, 'Processing complete');
      await callbacks.onComplete(result);
      return result;
    }

    // ─── Stage 5: Deep OCR (multi-provider) ─────────
    await emit('deep_ocr', 50, 'Running multi-provider deep scan');
    const eligibleProviders = deepProviders.filter((p) =>
      p.supportsFileType(input.mimeType),
    );

    const providerResults = await Promise.allSettled(
      eligibleProviders.map((p) => p.extract(input)),
    );

    const successfulExtractions: OcrOutput[] = providerResults
      .filter((r): r is PromiseFulfilledResult<OcrOutput> => r.status === 'fulfilled')
      .map((r) => r.value);

    // Include fast result in consensus
    const allExtractions = [fastOutput, ...successfulExtractions];
    result = { ...result, stage: 'deep_ocr', progress: 70, providerExtractions: allExtractions };

    // ─── Stage 6: Consensus ─────────────────────────
    await emit('consensus', 75, 'Analyzing provider agreement');
    const consensus = analyzeConsensus(
      allExtractions.map((e) => ({
        provider: e.provider,
        confidence: e.confidence,
        fields: e.fields,
        processingTimeMs: e.processingTimeMs,
      })),
    );

    // Pick the best extraction for fraud checks (highest confidence)
    const bestExtraction = allExtractions.reduce((best, curr) =>
      curr.confidence > best.confidence ? curr : best,
    );

    result = { ...result, stage: 'consensus', progress: 80, consensusFields: bestExtraction.fields };

    // ─── Stage 7: Deep Fraud Checks ─────────────────
    await emit('deep_fraud', 85, 'Running fraud detection');
    const fraudFlags = await callbacks.runFraudChecks(bestExtraction);

    // Add consensus penalty
    const agreementPenalty = consensus.agreed ? 0 : Math.round((1 - consensus.compositeConfidence) * 20);
    const confidencePenalty = bestExtraction.confidence < 0.8
      ? Math.round((1 - bestExtraction.confidence) * 15)
      : 0;

    const riskScore: RiskScore = calculateRiskScore(fraudFlags, confidencePenalty, agreementPenalty);

    result = {
      ...result,
      stage: 'completed',
      progress: 100,
      fraudChecks: fraudFlags as unknown as Record<string, unknown>,
      compositeScore: riskScore.score,
      riskCategory: riskScore.category,
      autoDecision: riskScore.decision,
    };

    await emit('completed', 100, 'Processing complete');
    await callbacks.onComplete(result);
    return result;

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    result = { ...result, stage: 'failed', error: message };
    await emit('failed', result.progress, message);
    await callbacks.onComplete(result);
    return result;
  }
}
