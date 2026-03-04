'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sponsorCopy } from '@/config/copy/sponsor';

type SponsorKycErrorProps = {
  reset: () => void;
};

export default function SponsorKycError({ reset }: SponsorKycErrorProps) {
  return (
    <Card className="mx-auto max-w-2xl border-destructive/30 bg-card/90 shadow-md dark:border-destructive/40 dark:bg-card/85">
      <CardHeader className="space-y-3">
        <div className="inline-flex size-10 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/40 dark:bg-destructive/15 dark:text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl text-card-foreground dark:text-card-foreground">
          {sponsorCopy.kyc.error.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
          {sponsorCopy.kyc.error.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" onClick={reset} className="min-h-11 w-full sm:w-auto">
          {sponsorCopy.kyc.error.retryLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
