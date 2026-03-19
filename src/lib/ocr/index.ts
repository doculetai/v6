/**
 * OCR pipeline — barrel export.
 */

export { runPipeline } from './orchestrator';
export { validateExtraction } from './validate-extraction';

export type {
  OcrProvider,
  OcrInput,
  OcrOutput,
  FastValidation,
  PipelineResult,
  PipelineEvent,
  PipelineStage,
} from './types';

export type { OrchestratorCallbacks } from './orchestrator';
