import { Circle, CircleCheckBig } from 'lucide-react';

import { cn } from '@/lib/utils';

type OnboardingProgressTrackerProps = {
  labels: string[];
  currentStep: number;
  ariaLabel: string;
};

export function OnboardingProgressTracker({
  labels,
  currentStep,
  ariaLabel,
}: OnboardingProgressTrackerProps) {
  return (
    <ol className="grid gap-2 md:grid-cols-4" aria-label={ariaLabel}>
      {labels.map((label, index) => {
        const stepNumber = index + 1;
        const isComplete = currentStep > stepNumber;
        const isCurrent = currentStep === stepNumber;

        return (
          <li
            key={label}
            className={cn(
              'flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 transition-colors duration-200',
              isCurrent
                ? 'border-primary/40 bg-primary/10 dark:border-primary/40 dark:bg-primary/10'
                : 'border-border bg-background/70 dark:border-border dark:bg-background/70',
            )}
          >
            {isComplete ? (
              <CircleCheckBig
                className="size-4 shrink-0 text-primary dark:text-primary"
                aria-hidden="true"
              />
            ) : (
              <Circle
                className={cn(
                  'size-4 shrink-0',
                  isCurrent
                    ? 'text-primary dark:text-primary'
                    : 'text-muted-foreground dark:text-muted-foreground',
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                'truncate text-sm',
                isCurrent
                  ? 'font-medium text-foreground dark:text-foreground'
                  : 'text-muted-foreground dark:text-muted-foreground',
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
