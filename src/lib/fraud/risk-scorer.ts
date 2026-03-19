/**
 * Risk scorer — takes all fraud flags and produces a 0-100 composite score.
 * 100 = maximum risk. Pure function.
 *
 * Scoring model:
 * - Start at 0 (no risk).
 * - Each flag adds weighted penalty points.
 * - Category and auto-decision derived from final score.
 */

import type { FraudFlags, RiskCategory, AutoDecision, RiskScore } from './types';

/** Penalty weights per flag. Sum of all = 100 (theoretical max). */
const WEIGHTS: Record<keyof FraudFlags, number> = {
  // Critical flags (15 pts each)
  balanceEquationFailed: 15,
  runningBalanceFailed: 15,

  // High flags (8-10 pts each)
  suspiciousDepositsFlagged: 10,
  recentLargeDepositFlagged: 8,
  crossStudentDuplicate: 10,
  duplicateDetected: 8,

  // Medium flags (5-6 pts each)
  roundNumbersFlagged: 5,
  missingDaysFlagged: 5,
  transactionPatternSuspicious: 6,
  balanceToIncomeSuspicious: 5,
  pdfMetadataFlagged: 6,

  // Lower flags (3-4 pts each)
  documentAgeFailed: 4,
  oddHoursTransactionsFlagged: 3,
  thresholdSkirtingFlagged: 4,
  periodOverlapFlagged: 4,
  uploadVelocityFlagged: 3,
  narrationInconsistencyFlagged: 4,
};

/** Score thresholds for risk categories. */
const THRESHOLDS: Array<{ max: number; category: RiskCategory; decision: AutoDecision }> = [
  { max: 15, category: 'low', decision: 'approve' },
  { max: 35, category: 'medium', decision: 'review' },
  { max: 60, category: 'high', decision: 'review' },
  { max: 100, category: 'critical', decision: 'reject' },
];

/** Calculate composite risk score from fraud flags. Pure function. */
export function calculateRiskScore(
  flags: FraudFlags,
  confidencePenalty: number = 0,
  agreementPenalty: number = 0,
): RiskScore {
  // Sum fraud penalties
  let fraudPenalty = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    if (flags[key as keyof FraudFlags]) {
      fraudPenalty += weight;
    }
  }

  // Composite score capped at 100
  const score = Math.min(100, fraudPenalty + confidencePenalty + agreementPenalty);

  // Determine category and decision
  const tier = THRESHOLDS.find((t) => score <= t.max) ?? THRESHOLDS[THRESHOLDS.length - 1];

  return {
    score,
    category: tier.category,
    decision: tier.decision,
    breakdown: {
      confidencePenalty,
      fraudPenalty,
      agreementPenalty,
    },
  };
}
