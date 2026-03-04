import {
  calculateProofChecklistStatus,
  createTamperEvidentToken,
  hasProofProgress,
  verifyTamperEvidentToken,
} from '@/server/routers/student-proof-utils';
import { describe, expect, it } from 'vitest';

import {
  activeProgressSignalsFixture,
  completeChecklistInputFixture,
  emptyProgressSignalsFixture,
  partialChecklistInputFixture,
  tokenFixture,
} from '../fixtures/student-proof';

describe('student proof helpers', () => {
  it('marks all checklist items complete when required signals are verified', () => {
    const status = calculateProofChecklistStatus(completeChecklistInputFixture);

    expect(status.kycComplete).toBe(true);
    expect(status.bankComplete).toBe(true);
    expect(status.sponsorComplete).toBe(true);
    expect(status.documentsComplete).toBe(true);
    expect(status.completedCount).toBe(4);
    expect(status.totalCount).toBe(4);
  });

  it('computes partial completion correctly', () => {
    const status = calculateProofChecklistStatus(partialChecklistInputFixture);

    expect(status.kycComplete).toBe(false);
    expect(status.bankComplete).toBe(true);
    expect(status.sponsorComplete).toBe(false);
    expect(status.documentsComplete).toBe(false);
    expect(status.completedCount).toBe(1);
  });

  it('detects progress only when profile-backed onboarding has started', () => {
    expect(hasProofProgress(activeProgressSignalsFixture)).toBe(true);
    expect(hasProofProgress(emptyProgressSignalsFixture)).toBe(false);
  });

  it('creates a tamper-evident token that fails verification if modified', () => {
    const token = createTamperEvidentToken(tokenFixture);

    expect(verifyTamperEvidentToken(token, tokenFixture.secret)).toBe(true);

    const tamperedToken = `${token.slice(0, -1)}x`;

    expect(verifyTamperEvidentToken(tamperedToken, tokenFixture.secret)).toBe(false);
  });
});
