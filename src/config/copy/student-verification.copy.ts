export const kycFailureReasonKeys = [
  'name_mismatch',
  'nin_not_found',
  'bvn_not_found',
  'id_expired',
  'image_unclear',
  'attempts_exhausted',
] as const;

export type KycFailureReasonKey = (typeof kycFailureReasonKeys)[number];

export const studentVerificationCopy = {
  title: 'Identity Verification',
  description: 'Complete all three tiers to verify your proof of funds.',
  proofTarget: {
    label: (verified: string, target: string) => `${verified} of ${target} verified`,
  },
  tier1: {
    title: 'Phone verification',
    description: 'Confirm your mobile number to secure your account.',
    cta: 'Verify phone',
    completedSummary: (lastFour: string) => `Verified · Phone ending in ${lastFour}`,
    completedGeneric: 'Phone verified',
  },
  tier2: {
    title: 'Identity verification',
    description: 'Confirm your identity using your BVN, NIN, or passport.',
    cta: 'Verify identity',
    completedSummary: 'Identity verified',
    manualReviewNote:
      'Your identity is under manual review. We will notify you when it is complete.',
    failure: {
      title: 'Identity check failed',
      action: 'Correct and resubmit',
      resubmitCta: 'Resubmit identity',
      attemptsLeft: (n: number) => `${n} attempt${n === 1 ? '' : 's'} remaining`,
      reasons: {
        name_mismatch: 'Name on your ID does not match your signup name',
        nin_not_found: 'NIN could not be found in the database',
        bvn_not_found: 'BVN could not be found in the database',
        id_expired: 'Your ID document has expired',
        image_unclear: 'We could not read your ID document. Upload a clear image.',
        attempts_exhausted: 'Maximum attempts reached. Contact support to continue.',
        default: 'Your identity could not be verified',
      } satisfies Record<KycFailureReasonKey | 'default', string>,
    },
  },
  tier3: {
    title: 'Bank account',
    description:
      'Connect your bank account or upload a bank statement to confirm your balance.',
    cta: 'Connect bank',
    completedSummary: (bankName: string, masked: string) => `${bankName} · ${masked}`,
  },
};
