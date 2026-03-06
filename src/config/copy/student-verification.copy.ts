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
  },
  tier3: {
    title: 'Bank account',
    description:
      'Connect your bank account or upload a bank statement to confirm your balance.',
    cta: 'Connect bank',
    completedSummary: (bankName: string, masked: string) => `${bankName} · ${masked}`,
  },
};
