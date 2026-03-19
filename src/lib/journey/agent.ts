import type { JourneyStageCopy, JourneyStageStatus, JourneyState } from './types';

interface AgentJourneyInput {
  totalAssignedStudents: number;
  activeStudents: number;
  totalEarnedKobo: number;
}

const STAGE_ORDER = ['invite_students', 'guide_onboarding', 'facilitate_matching', 'earn_commissions'] as const;

function isStageComplete(stageId: string, data: AgentJourneyInput): boolean {
  switch (stageId) {
    case 'invite_students':
      return data.totalAssignedStudents > 0;
    case 'guide_onboarding':
      return data.activeStudents > 0;
    case 'facilitate_matching':
      return data.activeStudents > 0; // Approximation — matched with sponsors
    case 'earn_commissions':
      return data.totalEarnedKobo > 0;
    default:
      return false;
  }
}

export function computeAgentJourney(
  data: AgentJourneyInput,
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
