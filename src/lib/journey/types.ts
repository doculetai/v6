export type JourneyStageStatus = 'completed' | 'current' | 'upcoming';

export interface JourneyStage {
  id: string;
  label: string;
  status: JourneyStageStatus;
}

export interface JourneyNextAction {
  label: string;
  description: string;
  cta: string;
  href: string;
}

export interface JourneyState {
  stages: JourneyStage[];
  currentStageIndex: number;
  completedCount: number;
  totalCount: number;
  nextAction: JourneyNextAction | null;
  allComplete: boolean;
  completionMessage: string | null;
}

export interface JourneyStageCopy {
  stages: Record<string, string>;
  nextActions?: Record<string, JourneyNextAction>;
  completionMessage: string;
}
