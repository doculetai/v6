import type { JourneyStageCopy, JourneyStageStatus, JourneyState } from './types';

interface SponsorJourneyInput {
  pendingInvites: number;
  activeStudents: number;
  totalCommittedKobo: number;
  nextDisbursementAt: Date | null;
}

const STAGE_ORDER = ['review_invites', 'commit_funds', 'track_disbursements', 'view_certificates'] as const;

function isStageComplete(stageId: string, data: SponsorJourneyInput): boolean {
  switch (stageId) {
    case 'review_invites':
      return data.pendingInvites === 0 && data.activeStudents > 0;
    case 'commit_funds':
      return data.totalCommittedKobo > 0;
    case 'track_disbursements':
      return data.nextDisbursementAt !== null;
    case 'view_certificates':
      return false; // Future — always upcoming for now
    default:
      return false;
  }
}

export function computeSponsorJourney(
  data: SponsorJourneyInput,
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
  const nextAction = currentStageId ? (copy.nextActions?.[currentStageId] ?? null) : null;

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
