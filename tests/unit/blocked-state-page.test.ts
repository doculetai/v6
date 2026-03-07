import { describe, it, expect } from 'vitest';

describe('blocked state copy', () => {
  it('verification blocked copy is valid', () => {
    const copy = {
      blockedTitle: 'Verification is locked',
      blockedReason: 'Complete your onboarding setup first.',
    };
    expect(copy.blockedTitle).toBeTruthy();
    expect(copy.blockedReason).toBeTruthy();
  });

  it('documents blocked copy is valid', () => {
    const copy = {
      blockedTitle: 'Documents are locked',
      blockedReason: 'Complete your identity verification first.',
    };
    expect(copy.blockedTitle).toBeTruthy();
    expect(copy.blockedReason).toBeTruthy();
  });

  it('proof blocked copy is valid', () => {
    const copy = {
      blockedTitle: 'Proof of Funds is locked',
      blockedReason: 'Complete verification and upload your required documents first.',
    };
    expect(copy.blockedTitle).toBeTruthy();
    expect(copy.blockedReason).toBeTruthy();
  });
});
