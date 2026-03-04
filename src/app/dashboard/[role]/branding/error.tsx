'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { partnerCopy } from '@/config/copy/partner';

type DashboardBrandingErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardBrandingError({ reset }: DashboardBrandingErrorProps) {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <Card className="border-border bg-card/80 shadow-md dark:border-border dark:bg-card/80">
        <CardHeader className="space-y-3">
          <AlertTriangle className="size-5 text-destructive dark:text-destructive" aria-hidden="true" />
          <CardTitle className="text-xl text-card-foreground dark:text-card-foreground md:text-2xl">
            {partnerCopy.branding.states.errorTitle}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
            {partnerCopy.branding.states.errorDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" className="min-h-11" onClick={reset}>
            {partnerCopy.branding.states.retryCta}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
