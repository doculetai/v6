import { describe, expect, it } from 'vitest';
import { computeStudentTrustStage, getStudentQuickAction } from '@/lib/student-trust-stage';

describe('computeStudentTrustStage', () => {
  it('returns 0 when onboarding is not complete', () => {
    expect(computeStudentTrustStage({
      onboardingComplete: false,
      kycComplete: false,
      schoolComplete: false,
      bankComplete: false,
      sponsorComplete: false,
      documentsComplete: false,
      certificateIssued: false,
    })).toBe(0);
  });

  it('returns 1 when onboarding complete but checklist incomplete', () => {
    expect(computeStudentTrustStage({
      onboardingComplete: true,
      kycComplete: true,
      schoolComplete: true,
      bankComplete: false,
      sponsorComplete: false,
      documentsComplete: false,
      certificateIssued: false,
    })).toBe(1);
  });

  it('returns 2 when all checklist complete but no certificate', () => {
    expect(computeStudentTrustStage({
      onboardingComplete: true,
      kycComplete: true,
      schoolComplete: true,
      bankComplete: true,
      sponsorComplete: true,
      documentsComplete: true,
      certificateIssued: false,
    })).toBe(2);
  });

  it('returns 3 when certificate is issued', () => {
    expect(computeStudentTrustStage({
      onboardingComplete: true,
      kycComplete: true,
      schoolComplete: true,
      bankComplete: true,
      sponsorComplete: true,
      documentsComplete: true,
      certificateIssued: true,
    })).toBe(3);
  });
});

describe('getStudentQuickAction', () => {
  it('stage 0: points to setup', () => {
    const qa = getStudentQuickAction(0);
    expect(qa.href).toBe('/dashboard/student/setup');
    expect(qa.label).toBe('Set up your profile');
  });

  it('stage 1: points to verification', () => {
    const qa = getStudentQuickAction(1);
    expect(qa.href).toBe('/dashboard/student/verification');
  });

  it('stage 2: points to proof', () => {
    const qa = getStudentQuickAction(2);
    expect(qa.href).toBe('/dashboard/student/proof');
  });

  it('stage 3: points to proof (share)', () => {
    const qa = getStudentQuickAction(3);
    expect(qa.href).toBe('/dashboard/student/proof');
    expect(qa.label).toBe('Share your certificate');
  });
});
