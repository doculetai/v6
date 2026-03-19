/**
 * Multi-provider consensus engine — compares extractions from multiple OCR providers
 * and determines field-level confidence + overall agreement.
 * Pure function.
 */

import type { ProviderExtraction, StatementExtraction, AutoDecision, ConsensusResult } from './types';

/** Minimum number of providers needed for consensus. */
const MIN_PROVIDERS = 2;

/** Confidence threshold below which a field is considered disagreed. */
const FIELD_CONFIDENCE_THRESHOLD = 0.7;

/** Overall composite confidence below which the result is flagged. */
const COMPOSITE_CONFIDENCE_THRESHOLD = 0.8;

/** Critical fields that must agree between providers. */
const CRITICAL_FIELDS: Array<keyof StatementExtraction> = [
  'accountHolder',
  'accountNumber',
  'bankName',
  'openingBalance',
  'closingBalance',
  'totalCredits',
  'totalDebits',
];

/** Numeric fields — use tolerance-based comparison. */
const NUMERIC_FIELDS = new Set<string>([
  'openingBalance',
  'closingBalance',
  'totalCredits',
  'totalDebits',
]);

/** Tolerance for numeric comparison (0.01 = 1 kobo). */
const NUMERIC_EPSILON = 0.01;

/** Compare two values for equality (type-aware). */
function valuesMatch(a: unknown, b: unknown, field: string): boolean {
  if (a === undefined || b === undefined) return false;
  if (a === null || b === null) return false;

  if (NUMERIC_FIELDS.has(field)) {
    return Math.abs(Number(a) - Number(b)) < NUMERIC_EPSILON;
  }

  if (typeof a === 'string' && typeof b === 'string') {
    return a.toLowerCase().trim() === b.toLowerCase().trim();
  }

  return a === b;
}

/** Calculate field-level confidence as % of providers that agree on the majority value. */
function calculateFieldConfidence(
  extractions: ProviderExtraction[],
  field: keyof StatementExtraction,
): number {
  const values = extractions
    .map((e) => e.fields[field])
    .filter((v) => v !== undefined && v !== null);

  if (values.length < MIN_PROVIDERS) return 0;

  // Find the value with most agreement
  let maxAgreement = 0;
  for (let i = 0; i < values.length; i++) {
    let count = 0;
    for (let j = 0; j < values.length; j++) {
      if (valuesMatch(values[i], values[j], field)) count++;
    }
    if (count > maxAgreement) maxAgreement = count;
  }

  return maxAgreement / values.length;
}

/** Run multi-provider consensus analysis. Pure function. */
export function analyzeConsensus(
  extractions: ProviderExtraction[],
): ConsensusResult {
  if (extractions.length < MIN_PROVIDERS) {
    return {
      agreed: false,
      compositeConfidence: 0,
      criticalDisagreements: CRITICAL_FIELDS.length,
      fieldConfidences: {},
      decision: 'review',
    };
  }

  // Calculate per-field confidence
  const fieldConfidences: Record<string, number> = {};
  let criticalDisagreements = 0;
  let totalConfidence = 0;
  let fieldCount = 0;

  for (const field of CRITICAL_FIELDS) {
    const confidence = calculateFieldConfidence(extractions, field);
    fieldConfidences[field] = confidence;
    totalConfidence += confidence;
    fieldCount++;

    if (confidence < FIELD_CONFIDENCE_THRESHOLD) {
      criticalDisagreements++;
    }
  }

  const compositeConfidence = fieldCount > 0 ? totalConfidence / fieldCount : 0;

  // Weight by provider-reported confidence too
  const avgProviderConfidence =
    extractions.reduce((sum, e) => sum + e.confidence, 0) / extractions.length;

  const weightedConfidence = compositeConfidence * 0.7 + avgProviderConfidence * 0.3;

  // Determine decision
  let decision: AutoDecision = 'approve';
  if (criticalDisagreements > 0 || weightedConfidence < COMPOSITE_CONFIDENCE_THRESHOLD) {
    decision = criticalDisagreements >= 2 ? 'reject' : 'review';
  }

  return {
    agreed: criticalDisagreements === 0 && weightedConfidence >= COMPOSITE_CONFIDENCE_THRESHOLD,
    compositeConfidence: weightedConfidence,
    criticalDisagreements,
    fieldConfidences,
    decision,
  };
}
