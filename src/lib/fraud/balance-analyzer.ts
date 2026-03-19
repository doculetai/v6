/**
 * Balance analyzer — 6 sub-checks on statement arithmetic and patterns.
 * Pure function, no side effects, testable with typed fixtures.
 */

import type { BalanceAnalysisInput, BalanceAnalysisResult, TransactionRow } from './types';

/** Tolerance for floating-point comparison (0.01 = 1 kobo). */
const EPSILON = 0.01;

/** Percentage threshold for round-number detection. */
const ROUND_NUMBER_THRESHOLD = 0.6;

/** Minimum credit amount to flag as suspicious (N1,000,000). */
const SUSPICIOUS_DEPOSIT_MIN = 1_000_000;

/** Maximum consecutive days with no transactions before flagging. */
const MISSING_DAYS_MAX_GAP = 14;

/** Percentage of closing balance a single recent deposit must exceed. */
const RECENT_LARGE_DEPOSIT_RATIO = 0.5;

/** Days before statement end to consider a deposit "recent". */
const RECENT_DEPOSIT_WINDOW_DAYS = 7;

/** Check 1: opening + credits - debits = closing */
function checkBalanceEquation(input: BalanceAnalysisInput) {
  const expected = input.openingBalance + input.totalCredits - input.totalDebits;
  const discrepancy = Math.abs(expected - input.closingBalance);
  return { pass: discrepancy < EPSILON, discrepancy };
}

/** Check 2: Verify running balances add up sequentially. */
function checkRunningBalance(transactions: TransactionRow[]) {
  const withBalance = transactions.filter((t) => t.balance !== undefined);
  if (withBalance.length < 2) return { pass: true, failingRowIndices: [] as number[] };

  const failingRowIndices: number[] = [];
  for (let i = 1; i < withBalance.length; i++) {
    const prev = withBalance[i - 1].balance!;
    const curr = withBalance[i];
    const expected =
      curr.type === 'credit' ? prev + curr.amount : prev - curr.amount;
    if (Math.abs(expected - curr.balance!) > EPSILON) {
      failingRowIndices.push(i);
    }
  }

  return { pass: failingRowIndices.length === 0, failingRowIndices };
}

/** Check 3: Flag if too many amounts are round numbers (multiples of 1000). */
function checkRoundNumbers(transactions: TransactionRow[]) {
  if (transactions.length === 0) return { flagged: false, percentage: 0 };

  const roundCount = transactions.filter((t) => t.amount % 1000 === 0).length;
  const percentage = roundCount / transactions.length;
  return { flagged: percentage > ROUND_NUMBER_THRESHOLD, percentage };
}

/** Check 4: Detect unusually large single deposits. */
function checkSuspiciousDeposits(transactions: TransactionRow[]) {
  const indices: number[] = [];
  transactions.forEach((t, i) => {
    if (t.type === 'credit' && t.amount >= SUSPICIOUS_DEPOSIT_MIN) {
      indices.push(i);
    }
  });
  return { flagged: indices.length > 0, indices };
}

/** Check 5: Detect long gaps with no transactions. */
function checkMissingDays(transactions: TransactionRow[], period: { from: string; to: string }) {
  if (transactions.length === 0) {
    const start = new Date(period.from);
    const end = new Date(period.to);
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return { flagged: totalDays > MISSING_DAYS_MAX_GAP, maxConsecutiveGap: totalDays };
  }

  const dates = transactions
    .map((t) => new Date(t.date).getTime())
    .filter((d) => !isNaN(d))
    .sort((a, b) => a - b);

  let maxGap = 0;
  for (let i = 1; i < dates.length; i++) {
    const gap = Math.floor((dates[i] - dates[i - 1]) / (24 * 60 * 60 * 1000));
    if (gap > maxGap) maxGap = gap;
  }

  return { flagged: maxGap > MISSING_DAYS_MAX_GAP, maxConsecutiveGap: maxGap };
}

/** Check 6: Detect a single large deposit close to the statement end date. */
function checkRecentLargeDeposit(
  transactions: TransactionRow[],
  closingBalance: number,
  periodEnd: string,
) {
  const endDate = new Date(periodEnd);
  const windowStart = new Date(endDate);
  windowStart.setDate(windowStart.getDate() - RECENT_DEPOSIT_WINDOW_DAYS);

  let largestRecent: { amount: number; percentOfClosing: number } | null = null;

  for (const t of transactions) {
    if (t.type !== 'credit') continue;
    const txDate = new Date(t.date);
    if (txDate >= windowStart && txDate <= endDate) {
      const pct = closingBalance > 0 ? t.amount / closingBalance : 0;
      if (!largestRecent || t.amount > largestRecent.amount) {
        largestRecent = { amount: t.amount, percentOfClosing: pct };
      }
    }
  }

  if (!largestRecent) {
    return { flagged: false, amount: null, percentOfClosing: 0 };
  }

  return {
    flagged: largestRecent.percentOfClosing > RECENT_LARGE_DEPOSIT_RATIO,
    amount: largestRecent.amount,
    percentOfClosing: largestRecent.percentOfClosing,
  };
}

function determineOverallRisk(
  results: Omit<BalanceAnalysisResult, 'overallRisk'>,
): BalanceAnalysisResult['overallRisk'] {
  const critical =
    !results.balanceEquation.pass || !results.runningBalance.pass;
  const high =
    results.suspiciousDeposits.flagged && results.recentLargeDeposit.flagged;
  const medium =
    results.roundNumbers.flagged ||
    results.missingDays.flagged ||
    results.recentLargeDeposit.flagged;

  if (critical) return 'critical';
  if (high) return 'high';
  if (medium) return 'medium';
  return 'low';
}

/** Run all 6 balance sub-checks. Pure function. */
export function analyzeBalance(input: BalanceAnalysisInput): BalanceAnalysisResult {
  const balanceEquation = checkBalanceEquation(input);
  const runningBalance = checkRunningBalance(input.transactions);
  const roundNumbers = checkRoundNumbers(input.transactions);
  const suspiciousDeposits = checkSuspiciousDeposits(input.transactions);
  const missingDays = checkMissingDays(input.transactions, input.statementPeriod);
  const recentLargeDeposit = checkRecentLargeDeposit(
    input.transactions,
    input.closingBalance,
    input.statementPeriod.to,
  );

  const partial = {
    balanceEquation,
    runningBalance,
    roundNumbers,
    suspiciousDeposits,
    missingDays,
    recentLargeDeposit,
  };

  return { ...partial, overallRisk: determineOverallRisk(partial) };
}
