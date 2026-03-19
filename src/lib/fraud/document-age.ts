/**
 * Document age checker — flags statements older than a threshold.
 * Pure function. Most embassies require statements within 28-30 days.
 */

/** Default maximum age in days. */
const DEFAULT_MAX_AGE_DAYS = 30;

export type DocumentAgeResult = {
  ageDays: number;
  maxAllowedDays: number;
  flagged: boolean;
};

/** Check if the statement period end date is too old relative to the check date. */
export function checkDocumentAge(
  statementPeriodEnd: string,
  checkDate: string = new Date().toISOString(),
  maxAgeDays: number = DEFAULT_MAX_AGE_DAYS,
): DocumentAgeResult {
  const endDate = new Date(statementPeriodEnd);
  const now = new Date(checkDate);

  const ageDays = Math.floor(
    (now.getTime() - endDate.getTime()) / (24 * 60 * 60 * 1000),
  );

  return {
    ageDays: Math.max(0, ageDays),
    maxAllowedDays: maxAgeDays,
    flagged: ageDays > maxAgeDays,
  };
}
