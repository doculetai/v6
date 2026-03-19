/**
 * Duplicate detector — compares file hashes and statement metadata.
 * Pure function. Detects both exact re-uploads and cross-student duplicates.
 */

export type DuplicateCheckInput = {
  /** SHA-256 hash of the uploaded file. */
  fileHash: string;
  /** Student user ID who uploaded this document. */
  studentId: string;
  /** Statement metadata for content-level comparison. */
  accountNumber?: string;
  bankName?: string;
  statementPeriod?: { from: string; to: string };
};

export type ExistingDocument = {
  fileHash: string;
  studentId: string;
  accountNumber?: string;
  bankName?: string;
  statementPeriod?: { from: string; to: string };
};

export type DuplicateResult = {
  /** Exact file hash match (same PDF uploaded again). */
  exactDuplicate: boolean;
  /** Same account + period uploaded by a different student. */
  crossStudentDuplicate: boolean;
  /** Details for admin review. */
  matches: Array<{
    type: 'exact' | 'cross_student' | 'same_account_period';
    matchedStudentId: string;
  }>;
};

/** Check a document against existing documents for duplicates. Pure function. */
export function detectDuplicates(
  input: DuplicateCheckInput,
  existing: ExistingDocument[],
): DuplicateResult {
  const matches: DuplicateResult['matches'] = [];

  for (const doc of existing) {
    // Skip self-comparisons
    if (doc.studentId === input.studentId && doc.fileHash === input.fileHash) {
      continue;
    }

    // Exact hash match
    if (doc.fileHash === input.fileHash) {
      const type = doc.studentId !== input.studentId ? 'cross_student' : 'exact';
      matches.push({ type, matchedStudentId: doc.studentId });
      continue;
    }

    // Same account + overlapping period from different student
    if (
      doc.studentId !== input.studentId &&
      input.accountNumber &&
      doc.accountNumber &&
      input.accountNumber === doc.accountNumber &&
      input.bankName &&
      doc.bankName &&
      input.bankName.toLowerCase() === doc.bankName.toLowerCase() &&
      input.statementPeriod &&
      doc.statementPeriod &&
      periodsOverlap(input.statementPeriod, doc.statementPeriod)
    ) {
      matches.push({ type: 'cross_student', matchedStudentId: doc.studentId });
    }
  }

  return {
    exactDuplicate: matches.some((m) => m.type === 'exact'),
    crossStudentDuplicate: matches.some((m) => m.type === 'cross_student'),
    matches,
  };
}

function periodsOverlap(
  a: { from: string; to: string },
  b: { from: string; to: string },
): boolean {
  const aStart = new Date(a.from).getTime();
  const aEnd = new Date(a.to).getTime();
  const bStart = new Date(b.from).getTime();
  const bEnd = new Date(b.to).getTime();

  return aStart <= bEnd && bStart <= aEnd;
}
