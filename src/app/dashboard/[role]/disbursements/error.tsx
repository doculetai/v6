'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sponsorCopy } from '@/config/copy/sponsor';

type SponsorDisbursementsErrorProps = {
  error: Error;
  reset: () => void;
};

export default function SponsorDisbursementsError({
  error,
  reset,
}: SponsorDisbursementsErrorProps) {
  return (
    <Card className="border-destructive/30 bg-destructive/10 dark:border-destructive/40 dark:bg-destructive/15">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
          {sponsorCopy.disbursements.states.error}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-destructive">{error.message || sponsorCopy.errors.generic}</p>
        <Button type="button" variant="outline" className="h-11" onClick={reset}>
          {sponsorCopy.disbursements.actions.retry}
        </Button>
      </CardContent>
    </Card>
  );
}
