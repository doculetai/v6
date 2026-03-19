import type { JourneyStageCopy, JourneyStageStatus, JourneyState } from './types';

interface PartnerJourneyInput {
  activeApiKeys: number;
  apiCallsToday: number;
  totalStudents: number;
  verifiedStudents: number;
}

const STAGE_ORDER = ['create_api_key', 'configure_integration', 'enroll_students', 'monitor_throughput'] as const;

function isStageComplete(stageId: string, data: PartnerJourneyInput): boolean {
  switch (stageId) {
    case 'create_api_key':
      return data.activeApiKeys > 0;
    case 'configure_integration':
      return data.apiCallsToday > 0;
    case 'enroll_students':
      return data.totalStudents > 0;
    case 'monitor_throughput':
      return data.verifiedStudents > 0;
    default:
      return false;
  }
}

export function computePartnerJourney(
  data: PartnerJourneyInput,
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
