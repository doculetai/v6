'use client';

import { Check, ArrowRight } from '@/components/icons';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { uiPrimitives } from '@/config/copy/primitives/ui';
import type { JourneyNextAction, JourneyStage } from '@/lib/journey/types';
import { cn } from '@/lib/utils';

interface JourneyProgressProps {
  stages: JourneyStage[];
  nextAction: JourneyNextAction | null;
  allComplete: boolean;
  completionMessage: string | null;
  className?: string;
}

function StagePill({ status, label }: { status: JourneyStage['status']; label: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-1.5 transition-opacity duration-200 ease-out', status === 'upcoming' && 'opacity-60 pointer-events-none')}>
      <div
        className={cn(
          'flex h-7 min-w-[6rem] items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors duration-200 ease-out',
          status === 'completed' && 'bg-primary text-primary-foreground',
          status === 'current' && 'border-2 border-primary bg-primary/8 text-primary',
          status === 'upcoming' && 'border border-border bg-transparent text-muted-foreground',
        )}
      >
        {status === 'completed' ? (
          <Check weight="duotone" className="size-3 shrink-0" aria-hidden="true" />
        ) : status === 'current' ? (
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
        ) : null}
        <span className="truncate">{label}</span>
      </div>
    </div>
  );
}

function Connector({ completed }: { completed: boolean }) {
  return (
    <div
      className={cn(
        'hidden h-0.5 flex-1 sm:block transition-colors duration-200 ease-out',
        completed ? 'bg-primary/40' : 'bg-border',
      )}
      aria-hidden="true"
    />
  );
}

function JourneyProgress({
  stages,
  nextAction,
  allComplete,
  completionMessage,
  className,
}: JourneyProgressProps) {
  const currentIndex = stages.findIndex((s) => s.status === 'current');
  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const progressPct = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0;

  const stepLabel =
    currentIndex >= 0
      ? uiPrimitives.journeyProgress.stepOf(currentIndex + 1, stages.length)
      : uiPrimitives.journeyProgress.stepOf(stages.length, stages.length);

  const currentStage =
    allComplete
      ? stages[stages.length - 1]
      : stages[currentIndex >= 0 ? currentIndex : 0];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Desktop: horizontal pill steps */}
      <nav
        className="hidden sm:block"
        aria-label={uiPrimitives.journeyProgress.ariaLabel}
      >
        <ol className="flex items-center gap-0">
          {stages.map((stage, index) => (
            <li
              key={stage.id}
              className={cn(
                'flex items-center',
                index < stages.length - 1 ? 'flex-1' : '',
              )}
              aria-current={stage.status === 'current' ? 'step' : undefined}
            >
              <StagePill status={stage.status} label={stage.label} />
              {index < stages.length - 1 && (
                <Connector completed={stage.status === 'completed'} />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Mobile: progress bar + step label */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            {currentStage?.label}
          </p>
          <p className="text-xs text-muted-foreground">{stepLabel}</p>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-200 ease-out"
            style={{ width: `${progressPct}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Next action strip or completion message */}
      {allComplete && completionMessage ? (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.04] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Check className="size-4 shrink-0 text-primary" weight="duotone" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{completionMessage}</p>
          </div>
        </div>
      ) : nextAction ? (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.04] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/70">
                {uiPrimitives.journeyProgress.nextStep}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{nextAction.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{nextAction.description}</p>
            </div>
            <Button asChild size="sm" variant="default" className="mt-2 min-h-11 shrink-0 sm:mt-0">
              <Link href={nextAction.href} className="inline-flex items-center gap-1.5">
                {nextAction.cta}
                <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { JourneyProgress };
export type { JourneyProgressProps };
