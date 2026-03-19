/**
 * Transaction pattern analysis — scores 0-100 across 4 dimensions.
 * Below 30 = suspicious. Pure function.
 */

import type { TransactionRow, TransactionPatternResult } from './types';

/** Common real narration prefixes from Nigerian banks. */
const REAL_NARRATION_PREFIXES = [
  'pos', 'web', 'atm', 'nip', 'mob', 'trf', 'sal', 'int', 'chg',
  'transfer', 'payment', 'debit', 'credit', 'airtime', 'bill',
];

/** Score the quality of transaction narrations (0-25). */
function scoreNarrationQuality(transactions: TransactionRow[]): number {
  if (transactions.length === 0) return 0;

  let meaningful = 0;
  for (const t of transactions) {
    const desc = t.description.toLowerCase().trim();
    if (desc.length < 3) continue;
    const hasPrefix = REAL_NARRATION_PREFIXES.some((p) => desc.startsWith(p));
    const hasAlphaNum = /[a-z].*\d|\d.*[a-z]/.test(desc);
    if (hasPrefix || hasAlphaNum || desc.length > 10) meaningful++;
  }

  return Math.round((meaningful / transactions.length) * 25);
}

/** Score the variety of transaction amounts (0-25). */
function scoreAmountVariety(transactions: TransactionRow[]): number {
  if (transactions.length < 2) return 0;

  const uniqueAmounts = new Set(transactions.map((t) => t.amount));
  const ratio = uniqueAmounts.size / transactions.length;

  // If all amounts are identical → 0. High variety → 25.
  return Math.round(Math.min(ratio * 1.5, 1) * 25);
}

/** Score the frequency of transactions (0-25). */
function scoreFrequency(transactions: TransactionRow[], periodDays: number): number {
  if (periodDays <= 0) return 0;
  const txPerDay = transactions.length / periodDays;

  // 0 tx/day → 0, ~1 tx/day → 25, >3 tx/day caps at 25
  if (txPerDay <= 0) return 0;
  if (txPerDay >= 1) return 25;
  return Math.round(txPerDay * 25);
}

/** Score the temporal spread of transactions across the statement period (0-25). */
function scoreTemporalSpread(transactions: TransactionRow[], periodDays: number): number {
  if (transactions.length < 2 || periodDays <= 0) return 0;

  const dates = transactions
    .map((t) => new Date(t.date).getTime())
    .filter((d) => !isNaN(d))
    .sort((a, b) => a - b);

  if (dates.length < 2) return 0;

  const earliest = dates[0];
  const latest = dates[dates.length - 1];
  const spanDays = (latest - earliest) / (24 * 60 * 60 * 1000);
  const coverage = spanDays / periodDays;

  // Transactions covering >80% of the period → 25
  return Math.round(Math.min(coverage / 0.8, 1) * 25);
}

/** Analyze transaction patterns. Score 0-100, flagged if < 30. Pure function. */
export function analyzeTransactionPatterns(
  transactions: TransactionRow[],
  statementPeriod: { from: string; to: string },
): TransactionPatternResult {
  const start = new Date(statementPeriod.from);
  const end = new Date(statementPeriod.to);
  const periodDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));

  const narrationQuality = scoreNarrationQuality(transactions);
  const amountVariety = scoreAmountVariety(transactions);
  const frequency = scoreFrequency(transactions, periodDays);
  const temporalSpread = scoreTemporalSpread(transactions, periodDays);

  const score = narrationQuality + amountVariety + frequency + temporalSpread;

  return {
    score,
    flagged: score < 30,
    details: { narrationQuality, amountVariety, frequency, temporalSpread },
  };
}
