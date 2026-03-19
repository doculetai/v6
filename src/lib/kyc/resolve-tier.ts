import type { VerificationStatus } from '@/db/queries/student-verification';

type ResolveNextKycTierInput = {
  hasPhone: boolean;
  hasEmail: boolean;
  tier2Status: VerificationStatus;
  tier3Status: VerificationStatus;
  bankConnected: boolean;
};

/**
 * Determines the next KYC tier the student should complete.
 * Returns null when all verification is done.
 *
 * Tier 1 = contact basics (email + phone)
 * Tier 2 = government ID (BVN/NIN) via Dojah
 * Tier 3 = advanced ID + bank connection
 */
export function resolveNextKycTier(
  input: ResolveNextKycTierInput,
): 1 | 2 | 3 | null {
  // Tier 1: email + phone must be present
  if (!input.hasEmail || !input.hasPhone) {
    return 1;
  }

  // Tier 2: government ID check must be verified
  if (input.tier2Status !== 'verified') {
    return 2;
  }

  // Tier 3: advanced ID + bank — both must be verified/connected
  if (input.tier3Status !== 'verified' || !input.bankConnected) {
    return 3;
  }

  return null;
}
