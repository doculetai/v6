/**
 * Fraud detection engine — barrel export.
 * All checkers are pure functions with zero side effects.
 */

export { analyzeBalance } from './balance-analyzer';
export { runFraudChecksFromExtraction } from './run-all-checks';
export { analyzeConsensus } from './consensus-engine';
export { crossReferenceAccount } from './cross-reference';
export { checkDocumentAge } from './document-age';
export { detectDuplicates } from './duplicate-detector';
export { checkNarrationConsistency } from './narration-consistency';
export { checkOddHoursTransactions } from './odd-hours';
export { checkPeriodOverlaps } from './period-overlap';
export { calculateRiskScore } from './risk-scorer';
export { checkThresholdSkirting } from './threshold-skirting';
export { analyzeTransactionPatterns } from './transaction-patterns';
export { checkUploadVelocity } from './upload-velocity';

export type {
  TransactionRow,
  StatementExtraction,
  BalanceAnalysisInput,
  BalanceAnalysisResult,
  TransactionPatternResult,
  CrossReferenceResult,
  FraudFlags,
  RiskCategory,
  AutoDecision,
  RiskScore,
  ConsensusResult,
  ProviderExtraction,
} from './types';

export type { DocumentAgeResult } from './document-age';
export type { DuplicateCheckInput, DuplicateResult, ExistingDocument } from './duplicate-detector';
export type { NarrationConsistencyResult } from './narration-consistency';
export type { OddHoursResult } from './odd-hours';
export type { PeriodOverlapResult, StatementPeriod } from './period-overlap';
export type { ThresholdSkirtingResult } from './threshold-skirting';
export type { UploadVelocityResult, UploadEvent } from './upload-velocity';
