/**
 * Threshold-skirting detector — flags transactions just below reporting thresholds.
 * Nigerian banks must report transactions >= N5,000,000 to NFIU.
 * Structuring deposits just under this limit is a red flag.
 * Pure function.
 */

import type { TransactionRow } from './types';

/** NFIU reporting threshold in Naira. */
const NFIU_THRESHOLD = 5_000_000;

/** How close to the threshold counts as skirting (within 10%). */
const SKIRTING_RANGE = 0.1;

/** Minimum number of skirting transactions to flag. */
const MIN_SKIRTING_COUNT = 2;

export type ThresholdSkirtingResult = {
  flagged: boolean;
  skirtingTransactions: number;
  threshold: number;
  details: Array<{ index: number; amount: number }>;
};

/** Detect transactions clustered just below reporting thresholds. */
export function checkThresholdSkirting(
  transactions: TransactionRow[],
): ThresholdSkirtingResult {
  const lowerBound = NFIU_THRESHOLD * (1 - SKIRTING_RANGE);
  const details: Array<{ index: number; amount: number }> = [];

  transactions.forEach((t, i) => {
    if (t.type === 'credit' && t.amount >= lowerBound && t.amount < NFIU_THRESHOLD) {
      details.push({ index: i, amount: t.amount });
    }
  });

  return {
    flagged: details.length >= MIN_SKIRTING_COUNT,
    skirtingTransactions: details.length,
    threshold: NFIU_THRESHOLD,
    details,
  };
}
