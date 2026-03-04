import { BookOpenText, ShieldCheck, Sparkles } from 'lucide-react';

import { studentCopy } from '@/config/copy/student';

import { OnboardingProgressTracker } from './OnboardingProgressTracker';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

const onboardingCopy = studentCopy.onboardingWizard;

type OnboardingHeroProps = {
  currentStep: number;
  stepLabels: string[];
};

export function OnboardingHero({ currentStep, stepLabels }: OnboardingHeroProps) {
  return (
    <Card className="relative overflow-hidden border-border bg-card dark:border-border dark:bg-card">
      <div className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-primary/10 blur-3xl dark:bg-primary/10" />
      <div className="pointer-events-none absolute -left-10 bottom-0 size-44 rounded-full bg-secondary/60 blur-3xl dark:bg-secondary/60" />
      <CardHeader className="space-y-4">
        <Badge variant="secondary" className="w-fit">
          {onboardingCopy.badge}
        </Badge>
        <div className="space-y-2">
          <CardTitle className="text-3xl text-card-foreground dark:text-card-foreground md:text-5xl">
            {onboardingCopy.title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
            {onboardingCopy.subtitle}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-2">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {onboardingCopy.trustSignals.secure}
          </Badge>
          <Badge variant="outline" className="gap-2">
            <BookOpenText className="size-4" aria-hidden="true" />
            {onboardingCopy.trustSignals.audit}
          </Badge>
          <Badge variant="outline" className="gap-2">
            <Sparkles className="size-4" aria-hidden="true" />
            {onboardingCopy.trustSignals.compliant}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
          {`${onboardingCopy.progress.label} ${currentStep} ${onboardingCopy.progress.of} ${stepLabels.length}`}
        </p>
        <OnboardingProgressTracker
          labels={stepLabels}
          currentStep={currentStep}
          ariaLabel={onboardingCopy.progress.ariaLabel}
        />
      </CardContent>
    </Card>
  );
}

export function OnboardingLoadingState() {
  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <Card className="border-border bg-card dark:border-border dark:bg-card">
        <CardHeader className="space-y-3">
          <Skeleton className="h-6 w-40 bg-accent dark:bg-accent" />
          <Skeleton className="h-10 w-full max-w-lg bg-accent dark:bg-accent" />
          <Skeleton className="h-5 w-full max-w-xl bg-accent dark:bg-accent" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-11 w-full bg-accent dark:bg-accent" />
          <Skeleton className="h-11 w-full bg-accent dark:bg-accent" />
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            {onboardingCopy.loading.description}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
