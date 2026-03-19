/**
 * Period overlap detector — flags when a student uploads multiple statements
 * with overlapping date ranges. Could indicate manipulation.
 * Pure function.
 */

export type StatementPeriod = {
  documentId: string;
  from: string;
  to: string;
};

export type PeriodOverlapResult = {
  flagged: boolean;
  overlaps: Array<{
    documentA: string;
    documentB: string;
    overlapDays: number;
  }>;
};

/** Detect overlapping statement periods across multiple documents. */
export function checkPeriodOverlaps(
  periods: StatementPeriod[],
): PeriodOverlapResult {
  const overlaps: PeriodOverlapResult['overlaps'] = [];

  for (let i = 0; i < periods.length; i++) {
    for (let j = i + 1; j < periods.length; j++) {
      const a = periods[i];
      const b = periods[j];

      const aStart = new Date(a.from).getTime();
      const aEnd = new Date(a.to).getTime();
      const bStart = new Date(b.from).getTime();
      const bEnd = new Date(b.to).getTime();

      if (aStart <= bEnd && bStart <= aEnd) {
        const overlapStart = Math.max(aStart, bStart);
        const overlapEnd = Math.min(aEnd, bEnd);
        const overlapDays = Math.ceil(
          (overlapEnd - overlapStart) / (24 * 60 * 60 * 1000),
        );

        if (overlapDays > 0) {
          overlaps.push({
            documentA: a.documentId,
            documentB: b.documentId,
            overlapDays,
          });
        }
      }
    }
  }

  return {
    flagged: overlaps.length > 0,
    overlaps,
  };
}
