/**
 * Fast-path validation — checks whether a single extraction is trustworthy
 * enough to skip deep scan. Pure function.
 */

import type { OcrOutput, FastValidation } from './types';

/** Minimum confidence to accept without deep scan. */
const FAST_CONFIDENCE_THRESHOLD = 0.85;

/** Minimum number of transactions to consider a real statement. */
const MIN_TRANSACTION_COUNT = 3;

/** Required fields that must be present. */
const REQUIRED_FIELDS: Array<keyof NonNullable<OcrOutput['fields']>> = [
  'accountHolder',
  'accountNumber',
  'bankName',
  'openingBalance',
  'closingBalance',
  'statementPeriod',
];

/** Validate a fast-path extraction. Pure function. */
export function validateExtraction(output: OcrOutput): FastValidation {
  const issues: string[] = [];

  // Check confidence
  if (output.confidence < FAST_CONFIDENCE_THRESHOLD) {
    issues.push(`Low confidence: ${(output.confidence * 100).toFixed(1)}%`);
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    const value = output.fields[field];
    if (value === undefined || value === null || value === '') {
      issues.push(`Missing required field: ${field}`);
    }
  }

  // Check transactions
  if (output.transactions.length < MIN_TRANSACTION_COUNT) {
    issues.push(`Too few transactions: ${output.transactions.length}`);
  }

  // Check balance equation if all fields present
  const f = output.fields;
  if (
    f.openingBalance !== undefined &&
    f.closingBalance !== undefined &&
    f.totalCredits !== undefined &&
    f.totalDebits !== undefined
  ) {
    const expected = f.openingBalance + f.totalCredits - f.totalDebits;
    const diff = Math.abs(expected - f.closingBalance);
    if (diff > 0.01) {
      issues.push(`Balance mismatch: expected ${expected}, got ${f.closingBalance}`);
    }
  }

  // Check statement period
  if (f.statementPeriod) {
    const start = new Date(f.statementPeriod.from);
    const end = new Date(f.statementPeriod.to);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      issues.push('Invalid statement period dates');
    } else if (end <= start) {
      issues.push('Statement end date must be after start date');
    }
  }

  // Check for error from provider
  if (output.error) {
    issues.push(`Provider error: ${output.error}`);
  }

  const valid = issues.length === 0;
  const needsDeepScan = !valid || output.confidence < FAST_CONFIDENCE_THRESHOLD;

  return {
    valid,
    confidence: output.confidence,
    issues,
    needsDeepScan,
  };
}
