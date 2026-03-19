import type { JourneyStageCopy, JourneyStageStatus, JourneyState } from './types';

interface AdminJourneyInput {
  pendingReviews: number;
  flaggedItems: number;
}

const STAGE_ORDER = ['review_queue', 'resolve_flags', 'platform_health'] as const;

export function computeAdminJourney(
  data: AdminJourneyInput,
  copy: JourneyStageCopy,
): JourneyState {
  // Admin journey is cyclic — stages reset when new items arrive
  let currentStageIndex = -1;
  let completedCount = 0;

  const stages = STAGE_ORDER.map((id, index) => {
    let status: JourneyStageStatus;

    if (id === 'review_queue') {
      if (data.pendingReviews > 0) {
        if (currentStageIndex === -1) currentStageIndex = index;
        status = 'current';
      } else {
        completedCount++;
        status = 'completed';
      }
    } else if (id === 'resolve_flags') {
      if (data.flaggedItems > 0) {
        if (currentStageIndex === -1) currentStageIndex = index;
        status = 'current';
      } else {
        completedCount++;
        status = 'completed';
      }
    } else {
      // platform_health — current when both queues are clear
      if (data.pendingReviews === 0 && data.flaggedItems === 0) {
        completedCount++;
        status = 'completed';
      } else {
        status = 'upcoming';
      }
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
