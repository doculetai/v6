import type { JourneyNextAction, JourneyStageCopy, JourneyStageStatus, JourneyState } from './types';

export interface StudentJourneyInput {
  /** School selected + funding type set */
  onboardingComplete: boolean;
  /** All 3 verification tiers complete (phone + KYC + bank) */
  verificationComplete: boolean;
  /** Bank statement approved (only relevant on document-upload path) */
  documentsComplete: boolean;
  /** Certificate issued */
  proofReady: boolean;
}

const STAGE_ORDER = ['onboarding', 'verification', 'documents', 'proof'] as const;

const NEXT_ACTIONS: Record<string, JourneyNextAction> = {
  onboarding: {
    label: 'Set up your profile',
    description: 'Choose your school and how you plan to fund your program.',
    cta: 'Set up your profile',
    href: '/dashboard/student/setup',
  },
  verification: {
    label: 'Verify your identity',
    description: 'Confirm your phone, identity, and bank account.',
    cta: 'Continue verification',
    href: '/dashboard/student/verification',
  },
  documents: {
    label: 'Upload your bank statement',
    description: 'Upload a bank statement showing your available balance.',
    cta: 'Upload now',
    href: '/dashboard/student/documents',
  },
  proof: {
    label: 'View your certificate',
    description: 'Your application is complete. Review your proof-of-funds certificate.',
    cta: 'View certificate',
    href: '/dashboard/student/proof',
  },
};

function isStageComplete(stageId: string, data: StudentJourneyInput): boolean {
  switch (stageId) {
    case 'onboarding':
      return data.onboardingComplete;
    case 'verification':
      return data.verificationComplete;
    case 'documents':
      return data.documentsComplete;
    case 'proof':
      return data.proofReady;
    default:
      return false;
  }
}

export function computeStudentJourney(
  data: StudentJourneyInput,
  copy: JourneyStageCopy,
): JourneyState {
  let currentStageIndex = -1;
  let completedCount = 0;

  const stages = STAGE_ORDER.map((id, index) => {
    const completed = isStageComplete(id, data);
    let status: JourneyStageStatus;

    if (completed) {
      completedCount++;
      status = 'completed';
    } else if (currentStageIndex === -1) {
      currentStageIndex = index;
      status = 'current';
    } else {
      status = 'upcoming';
    }

    return { id, label: copy.stages[id] ?? id, status };
  });

  const allComplete = completedCount === STAGE_ORDER.length;
  const currentStageId = currentStageIndex >= 0 ? STAGE_ORDER[currentStageIndex] : null;
  const nextAction = currentStageId ? (NEXT_ACTIONS[currentStageId] ?? null) : null;

  return {
    stages,
    currentStageIndex,
    completedCount,
    totalCount: STAGE_ORDER.length,
    nextAction,
    allComplete,
    completionMessage: allComplete ? copy.completionMessage : null,
  };
}
