import { describe, expect, test } from 'vitest';

import { disbursementFixture, sponsorshipFixture } from '../fixtures/sponsor';
import {
  deriveStudentFundingStatus,
  getActivityToneFromDisbursementStatus,
  getKycTierFromSponsorStatus,
} from '@/db/queries/sponsor';

describe('sponsor dashboard helpers', () => {
  test('maps sponsor kyc status to tier level', () => {
    expect(getKycTierFromSponsorStatus('not_started')).toBe(1);
    expect(getKycTierFromSponsorStatus('pending')).toBe(2);
    expect(getKycTierFromSponsorStatus('verified')).toBe(3);
    expect(getKycTierFromSponsorStatus('failed')).toBe(1);
  });

  test('maps disbursement status to activity timeline tone', () => {
    expect(getActivityToneFromDisbursementStatus(disbursementFixture.status)).toBe('success');
    expect(getActivityToneFromDisbursementStatus('failed')).toBe('error');
    expect(getActivityToneFromDisbursementStatus('processing')).toBe('info');
    expect(getActivityToneFromDisbursementStatus('scheduled')).toBe('neutral');
  });

  test('derives student status from sponsorship lifecycle and certificate', () => {
    expect(deriveStudentFundingStatus('pending', false)).toBe('submitted');
    expect(deriveStudentFundingStatus(sponsorshipFixture.status, false)).toBe('under_review');
    expect(deriveStudentFundingStatus('completed', false)).toBe('approved');
    expect(deriveStudentFundingStatus('cancelled', false)).toBe('rejected');
    expect(deriveStudentFundingStatus('active', true)).toBe('certificate_issued');
  });
});
