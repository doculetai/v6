/**
 * OCR pipeline types — provider interface, extraction results, pipeline state.
 */

import type { StatementExtraction, TransactionRow } from '../fraud/types';

/** Pipeline stages matching the schema status enum. */
export type PipelineStage =
  | 'pending'
  | 'intake'
  | 'fast_ocr'
  | 'fast_validation'
  | 'fast_complete'
  | 'deep_ocr'
  | 'deep_fraud'
  | 'consensus'
  | 'completed'
  | 'failed'
  | 'partial';

/** Provider interface — any OCR service implements this. */
export type OcrProvider = {
  id: string;
  name: string;
  /** Extract structured data from a document. */
  extract: (input: OcrInput) => Promise<OcrOutput>;
  /** Whether this provider supports the given file type. */
  supportsFileType: (mimeType: string) => boolean;
  /** Estimated cost per page in USD. */
  costPerPage: number;
  /** Average processing time in ms (for routing decisions). */
  avgProcessingMs: number;
};

/** Input to an OCR provider. */
export type OcrInput = {
  fileUrl: string;
  mimeType: string;
  fileName: string;
  /** Number of pages (if known). */
  pageCount?: number;
};

/** Raw output from a single OCR provider. */
export type OcrOutput = {
  provider: string;
  confidence: number;
  fields: Partial<StatementExtraction>;
  transactions: TransactionRow[];
  rawText?: string;
  processingTimeMs: number;
  error?: string;
};

/** Validation result for a fast-path extraction. */
export type FastValidation = {
  valid: boolean;
  confidence: number;
  issues: string[];
  /** Should trigger deep scan? */
  needsDeepScan: boolean;
};

/** Complete pipeline result stored in the DB. */
export type PipelineResult = {
  stage: PipelineStage;
  progress: number;
  fastExtraction?: OcrOutput;
  fastValidation?: FastValidation;
  providerExtractions?: OcrOutput[];
  consensusFields?: Partial<StatementExtraction>;
  fraudChecks?: Record<string, unknown>;
  compositeScore?: number;
  riskCategory?: 'low' | 'medium' | 'high' | 'critical';
  autoDecision?: 'approve' | 'review' | 'reject';
  error?: string;
};

/** Pipeline event for progress tracking. */
export type PipelineEvent = {
  stage: PipelineStage;
  progress: number;
  message: string;
  timestamp: string;
};
