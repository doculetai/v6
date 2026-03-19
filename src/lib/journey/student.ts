import type { JourneyNextAction, JourneyStageCopy, JourneyStageStatus, JourneyState } from './types';
import { routes } from '@/config/routes';

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

// Fallback next-action copy used when the caller does not provide nextActions via JourneyStageCopy.
// Prefer copy.nextActions (from src/config/copy/dashboard-shell.ts) over this object.
const FALLBACK_NEXT_ACTIONS: Record<string, JourneyNextAction> = {
  onboarding: {
    label: 'Profile setup',
    description: 'Choose your school and program to set your funding target.',
    cta: 'Set up your profile',
    href: routes.dashboard.student.setup,
  },
  verification: {
    label: 'Identity verification',
    description: 'Confirm your phone number, identity, and bank details.',
    cta: 'Continue verification',
    href: routes.dashboard.student.verification,
  },
  documents: {
    label: 'Bank statement',
    description: 'Upload a bank statement showing your available balance.',
    cta: 'Upload statement',
    href: routes.dashboard.student.documents,
  },
  proof: {
    label: 'Proof of Funds',
    description: 'Your application is complete. Review your proof of funds certificate.',
    cta: 'View certificate',
    href: routes.dashboard.student.proof,
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
  const nextActionsMap = copy.nextActions ?? FALLBACK_NEXT_ACTIONS;
  const nextAction = currentStageId ? (nextActionsMap[currentStageId] ?? null) : null;

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
