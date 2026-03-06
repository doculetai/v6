import type { Icon } from '@phosphor-icons/react';
import { ArrowRight, Trophy } from '@phosphor-icons/react/dist/ssr';

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

type QuickAction = { label: string; href: string; icon: Icon };

export function getStudentQuickAction(stage: StudentTrustStage): QuickAction {
  switch (stage) {
    case 0:
      return { label: 'Set up your application', href: '/dashboard/student/onboarding', icon: ArrowRight };
    case 1:
      return { label: 'Continue your application', href: '/dashboard/student/verify', icon: ArrowRight };
    case 2:
      return { label: 'View your proof', href: '/dashboard/student/proof', icon: Trophy };
    case 3:
      return { label: 'Share your certificate', href: '/dashboard/student/proof', icon: Trophy };
  }
}
