import { Shield, ShieldCheck } from 'lucide-react';

import { PipelineStepper } from '@/components/ui/pipeline-stepper';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';

import type { SponsorKycStatusSnapshot } from '@/db/queries/sponsor-kyc';

type SponsorKycTierProgressProps = {
  snapshot: SponsorKycStatusSnapshot;
  className?: string;
};

function stepState(currentStep: number, step: number): 'completed' | 'current' | 'upcoming' {
  if (currentStep > step) return 'completed';
  if (currentStep === step) return 'current';
  return 'upcoming';
}

export function SponsorKycTierProgress({ snapshot, className }: SponsorKycTierProgressProps) {
  const steps = [
    {
      id: 'identity',
      label: sponsorCopy.kyc.stepLabels.identity,
      status: stepState(snapshot.currentStep, 1),
    },
    {
      id: 'source',
      label: sponsorCopy.kyc.stepLabels.sourceOfFunds,
      status: stepState(snapshot.currentStep, 2),
    },
    {
      id: 'bank',
      label: sponsorCopy.kyc.stepLabels.bankVerification,
      status: stepState(snapshot.currentStep, 3),
    },
    {
      id: 'corporate',
      label: snapshot.isCorporate
        ? sponsorCopy.kyc.stepLabels.corporateChecks
        : sponsorCopy.kyc.stepLabels.adminReview,
      status: stepState(snapshot.currentStep, 4),
    },
  ];

  return (
    <Card
      className={cn(
        'border-border/70 bg-card/85 text-card-foreground shadow-lg backdrop-blur-sm dark:border-border dark:bg-card/80',
        className,
      )}
    >
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-lg text-card-foreground dark:text-card-foreground">
          <Shield className="size-5 text-primary dark:text-primary" aria-hidden="true" />
          {sponsorCopy.kyc.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
          {sponsorCopy.kyc.subtitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Badge
            variant="outline"
            className={cn(
              'min-h-11 justify-center border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground',
              snapshot.tier >= 1 && 'border-border bg-background text-foreground dark:bg-background dark:text-foreground',
            )}
          >
            {sponsorCopy.kyc.tierBadges.tier1}
          </Badge>

          <Badge
            variant="outline"
            className={cn(
              'min-h-11 justify-center border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground',
              snapshot.tier >= 2 && 'border-primary/30 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/15 dark:text-primary',
            )}
          >
            {sponsorCopy.kyc.tierBadges.tier2}
          </Badge>

          <Badge
            variant="outline"
            className={cn(
              'min-h-11 justify-center gap-1 border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground',
              snapshot.tier >= 3 && 'border-success/30 bg-success/10 text-success dark:border-success/40 dark:bg-success/15 dark:text-success',
            )}
          >
            <ShieldCheck className="size-4" aria-hidden="true" />
            {sponsorCopy.kyc.tierBadges.tier3}
          </Badge>
        </div>

        <PipelineStepper steps={steps} />
      </CardContent>
    </Card>
  );
}
