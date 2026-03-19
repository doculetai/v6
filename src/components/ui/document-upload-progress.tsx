'use client';

import { useEffect, useMemo } from 'react';
import { CheckCircle, CircleNotch, Circle } from '@/components/icons';

import { cn } from '@/lib/utils';
import { primitivesCopy } from '@/config/copy/primitives';

export type UploadStage = 'uploading' | 'scanning' | 'processing' | 'submitted';

type StageConfig = {
  key: UploadStage;
  label: string;
};

type DocumentUploadProgressProps = {
  /** Current active stage. Set to null to hide progress. */
  currentStage: UploadStage | null;
  /** Labels for each stage. Pass from copy config. */
  stageLabels: Record<UploadStage, string>;
  /** Called when all stages complete (after the submitted stage). */
  onComplete?: () => void;
  className?: string;
};

const STAGE_ORDER: UploadStage[] = ['uploading', 'scanning', 'processing', 'submitted'];

function getStageIndex(stage: UploadStage): number {
  return STAGE_ORDER.indexOf(stage);
}

function StageIcon({ status }: { status: 'complete' | 'active' | 'pending' }) {
  if (status === 'complete') {
    return (
      <div className="flex size-6 items-center justify-center rounded-full bg-primary/15">
        <CheckCircle weight="fill" className="size-5 text-primary" aria-hidden="true" />
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="flex size-6 items-center justify-center rounded-full bg-primary/15">
        <CircleNotch weight="bold" className="size-4 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex size-6 items-center justify-center">
      <Circle weight="regular" className="size-4 text-muted-foreground/50" aria-hidden="true" />
    </div>
  );
}

export function DocumentUploadProgress({
  currentStage,
  stageLabels,
  onComplete,
  className,
}: DocumentUploadProgressProps) {
  // Derive completed stages purely from currentStage prop
  const completedStages = useMemo(() => {
    if (!currentStage) return new Set<UploadStage>();
    const currentIndex = getStageIndex(currentStage);
    const set = new Set<UploadStage>();
    for (let i = 0; i < currentIndex; i++) {
      set.add(STAGE_ORDER[i]);
    }
    return set;
  }, [currentStage]);

  // Fire onComplete callback after a delay when the submitted stage is reached
  useEffect(() => {
    if (currentStage !== 'submitted') return;
    const timer = setTimeout(() => onComplete?.(), 1200);
    return () => clearTimeout(timer);
  }, [currentStage, onComplete]);

  if (!currentStage) return null;

  const stages: StageConfig[] = STAGE_ORDER.map((key) => ({
    key,
    label: stageLabels[key],
  }));

  const currentIndex = getStageIndex(currentStage);
  const allComplete = completedStages.size === STAGE_ORDER.length;

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card/95 px-4 py-4 shadow-sm transition-all duration-300 dark:bg-card/90',
        allComplete && 'border-primary/30 bg-primary/5',
        className,
      )}
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={STAGE_ORDER.length}
      aria-label={primitivesCopy.ariaExtended.documentUploadProgress}
    >
      {/* Progress bar */}
      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{
            width: allComplete
              ? '100%'
              : `${((currentIndex + 0.5) / STAGE_ORDER.length) * 100}%`,
          }}
        />
      </div>

      {/* Stage list */}
      <ol className="space-y-2">
        {stages.map((stage) => {
          const isComplete = completedStages.has(stage.key);
          const isActive = stage.key === currentStage && !isComplete;
          const status = isComplete ? 'complete' : isActive ? 'active' : 'pending';

          return (
            <li
              key={stage.key}
              className={cn(
                'flex items-center gap-3 transition-opacity duration-300',
                status === 'pending' && 'opacity-40',
              )}
            >
              <StageIcon status={status} />
              <span
                className={cn(
                  'text-sm transition-colors duration-200',
                  status === 'active' && 'font-medium text-foreground',
                  status === 'complete' && 'text-muted-foreground line-through decoration-primary/30',
                  status === 'pending' && 'text-muted-foreground',
                )}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
