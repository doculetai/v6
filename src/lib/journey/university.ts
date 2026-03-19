import type { JourneyStageCopy, JourneyStageStatus, JourneyState } from './types';

interface UniversityJourneyInput {
  totalPrograms: number;
  totalStudents: number;
  pendingCount: number;
}

const STAGE_ORDER = ['manage_programmes', 'receive_applications', 'monitor_enrolment'] as const;

function isStageComplete(stageId: string, data: UniversityJourneyInput): boolean {
  switch (stageId) {
    case 'manage_programmes':
      return data.totalPrograms > 0;
    case 'receive_applications':
      return data.totalStudents > 0;
    case 'monitor_enrolment':
      return data.pendingCount === 0 && data.totalStudents > 0;
    default:
      return false;
  }
}

export function computeUniversityJourney(
  data: UniversityJourneyInput,
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
