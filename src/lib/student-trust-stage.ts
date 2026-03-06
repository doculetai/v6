export type StudentTrustStage = 0 | 1 | 2 | 3;

export type StudentTrustStageInput = {
  onboardingComplete: boolean;
  kycComplete: boolean;
  schoolComplete: boolean;
  bankComplete: boolean;
  sponsorComplete: boolean;
  documentsComplete: boolean;
  certificateIssued: boolean;
};

export function computeStudentTrustStage(input: StudentTrustStageInput): StudentTrustStage {
  if (!input.onboardingComplete) return 0;
  if (input.certificateIssued) return 3;

  const allComplete =
    input.kycComplete &&
    input.schoolComplete &&
    input.bankComplete &&
    input.sponsorComplete &&
    input.documentsComplete;

  return allComplete ? 2 : 1;
}

// Icon-free — safe to import in Server Components and Client Components alike.
type QuickActionBase = { label: string; href: string };

export function getStudentQuickAction(stage: StudentTrustStage): QuickActionBase {
  switch (stage) {
    case 0:
      return { label: 'Set up your profile', href: '/dashboard/student/setup' };
    case 1:
      return { label: 'Continue verification', href: '/dashboard/student/verification' };
    case 2:
      return { label: 'View your proof', href: '/dashboard/student/proof' };
    case 3:
      return { label: 'Share your certificate', href: '/dashboard/student/proof' };
  }
}
