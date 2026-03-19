/**
 * Narration consistency checker — analyzes whether transaction descriptions
 * follow patterns typical of real Nigerian bank statements.
 * Pure function.
 */

import type { TransactionRow } from './types';

/** Common narration patterns from Nigerian banks. */
const BANK_PATTERNS = [
  /^(pos|web|atm|nip|mob)\s/i,               // Channel prefix
  /^(trf|transfer)\s/i,                        // Transfer
  /^(sal|salary)\s/i,                          // Salary
  /^(int|interest)\s/i,                        // Interest
  /^(chg|charge|fee|commission)\s/i,           // Charges
  /^(airtime|data|bill|utility)\s/i,           // Bills
  /^(debit|credit)\s/i,                        // Type prefix
  /\b\d{10}\b/,                                // 10-digit account number in narration
  /\b[A-Z]{3}\d{6,}/,                          // Reference codes (e.g., NIP123456)
  /\b\d{2}\/\d{2}\/\d{2,4}\b/,                // Date in narration
];

/** Suspicious narration patterns (too generic or synthetic-looking). */
const SUSPICIOUS_PATTERNS = [
  /^transaction\s*#?\d+$/i,                    // "Transaction 1", "Transaction #2"
  /^(test|sample|demo|fake|dummy)/i,           // Test data prefixes
  /^[a-z]+\s[a-z]+$/i,                         // Two generic words (e.g., "money transfer")
  /^[\d.]+$/,                                   // Just numbers
];

export type NarrationConsistencyResult = {
  flagged: boolean;
  /** Percentage of narrations matching real bank patterns. */
  realPatternRate: number;
  /** Percentage of narrations matching suspicious patterns. */
  suspiciousPatternRate: number;
  /** Number of unique narration formats (low = synthetic). */
  uniqueFormatCount: number;
  totalAnalyzed: number;
};

/** Analyze narration consistency across transactions. */
export function checkNarrationConsistency(
  transactions: TransactionRow[],
): NarrationConsistencyResult {
  if (transactions.length === 0) {
    return {
      flagged: false,
      realPatternRate: 0,
      suspiciousPatternRate: 0,
      uniqueFormatCount: 0,
      totalAnalyzed: 0,
    };
  }

  let realMatches = 0;
  let suspiciousMatches = 0;
  const formatSet = new Set<string>();

  for (const t of transactions) {
    const desc = t.description.trim();
    if (desc.length === 0) continue;

    // Extract the first word as a "format" fingerprint
    const firstWord = desc.split(/\s+/)[0].toLowerCase();
    formatSet.add(firstWord);

    // Check against real bank patterns
    const matchesReal = BANK_PATTERNS.some((p) => p.test(desc));
    if (matchesReal) realMatches++;

    // Check against suspicious patterns
    const matchesSuspicious = SUSPICIOUS_PATTERNS.some((p) => p.test(desc));
    if (matchesSuspicious) suspiciousMatches++;
  }

  const total = transactions.length;
  const realPatternRate = realMatches / total;
  const suspiciousPatternRate = suspiciousMatches / total;

  // Flag if too few real patterns OR too many suspicious ones OR too few unique formats
  const tooFewReal = realPatternRate < 0.3 && total > 5;
  const tooManySuspicious = suspiciousPatternRate > 0.2;
  const tooFewFormats = formatSet.size < 3 && total > 10;

  return {
    flagged: tooFewReal || tooManySuspicious || tooFewFormats,
    realPatternRate,
    suspiciousPatternRate,
    uniqueFormatCount: formatSet.size,
    totalAnalyzed: total,
  };
}
