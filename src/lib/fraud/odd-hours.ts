/**
 * Odd-hours detector — flags statements where too many transactions occur
 * between midnight and 6am. Real accounts rarely have nighttime activity.
 * Pure function.
 */

import type { TransactionRow } from './types';

/** Percentage of transactions in odd hours before flagging. */
const ODD_HOURS_THRESHOLD = 0.3;

/** Start of odd hours (midnight). */
const ODD_START = 0;

/** End of odd hours (6am). */
const ODD_END = 6;

export type OddHoursResult = {
  flagged: boolean;
  oddHoursCount: number;
  totalWithTime: number;
  percentage: number;
};

/** Check for suspicious concentration of transactions during odd hours. */
export function checkOddHoursTransactions(
  transactions: TransactionRow[],
): OddHoursResult {
  let oddCount = 0;
  let withTime = 0;

  for (const t of transactions) {
    const date = new Date(t.date);
    if (isNaN(date.getTime())) continue;

    // Only count transactions that have a time component (not just date)
    const hasTime = t.date.includes('T') || t.date.includes(':');
    if (!hasTime) continue;

    withTime++;
    const hour = date.getHours();
    if (hour >= ODD_START && hour < ODD_END) {
      oddCount++;
    }
  }

  if (withTime === 0) {
    return { flagged: false, oddHoursCount: 0, totalWithTime: 0, percentage: 0 };
  }

  const percentage = oddCount / withTime;

  return {
    flagged: percentage > ODD_HOURS_THRESHOLD,
    oddHoursCount: oddCount,
    totalWithTime: withTime,
    percentage,
  };
}
