import {
  computeStudentVerificationProgress,
  maskAccountNumber,
} from '@/db/queries/student-verification';
import { describe, expect, it } from 'vitest';

import { verificationProgressFixtures } from '../fixtures/student-verification';

describe('computeStudentVerificationProgress', () => {
  it.each(verificationProgressFixtures)('$name', (fixture) => {
    const { input, expected } = fixture;
    const result = computeStudentVerificationProgress(input);

    expect(result.completionPercent).toBe(expected.completionPercent);
    expect(result.overallStatus).toBe(expected.overallStatus);
    expect(result.tiers.map((tier) => tier.status)).toEqual(expected.tierStatuses);
  });
});

describe('maskAccountNumber', () => {
  it('returns masked account number with only last four digits visible', () => {
    expect(maskAccountNumber('0123456789')).toBe('****6789');
  });

  it('handles short account numbers safely', () => {
    expect(maskAccountNumber('345')).toBe('****345');
  });
});
