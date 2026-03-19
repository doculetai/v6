import { pipelineRuns } from '@/db/schema';

type PipelineRunRow = typeof pipelineRuns.$inferSelect;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export type LatestOcrRunView = {
  documentId: string;
  status: PipelineRunRow['status'];
  progress: number;
  extractedName: string | null;
  extractedBalance: number | null;
  confidence: number | null;
  riskCategory: PipelineRunRow['riskCategory'] | null;
  compositeScore: number | null;
  autoDecision: PipelineRunRow['autoDecision'] | null;
  errorMessage: string | null;
  currentStep: string | null;
};

export function mapLatestOcrRun(documentId: string, run: PipelineRunRow): LatestOcrRunView {
  const fastExtraction = asRecord(run.fastExtraction);
  const fastFields = asRecord(fastExtraction?.fields);
  const consensusFields = asRecord(run.consensusResult);
  const extractedFields = consensusFields ?? fastFields;

  return {
    documentId,
    status: run.status,
    progress: run.progress,
    extractedName: asString(extractedFields?.accountHolder) ?? run.accountHolder ?? null,
    extractedBalance:
      asNumber(extractedFields?.closingBalance) ?? asNumber(extractedFields?.openingBalance),
    confidence: asNumber(fastExtraction?.confidence),
    riskCategory: run.riskCategory ?? null,
    compositeScore: run.compositeScore ?? null,
    autoDecision: run.autoDecision ?? null,
    errorMessage: run.errorMessage ?? null,
    currentStep: run.currentStep ?? null,
  };
}
