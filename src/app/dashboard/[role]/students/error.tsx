'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sponsorCopy } from '@/config/copy/sponsor';

type SponsorStudentsErrorProps = {
  error: Error;
  reset: () => void;
};

export default function SponsorStudentsError({ error, reset }: SponsorStudentsErrorProps) {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <Card className="border-border bg-card text-card-foreground dark:border-border dark:bg-card">
        <CardHeader className="space-y-3">
          <AlertTriangle className="size-5 text-muted-foreground dark:text-muted-foreground" />
          <CardTitle className="text-xl text-card-foreground dark:text-card-foreground md:text-2xl">
            {sponsorCopy.students.error.title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
            {sponsorCopy.students.error.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" className="min-h-11" onClick={reset}>
            {sponsorCopy.students.error.retryCta}
          </Button>
          {error.message ? (
            <p className="mt-3 text-xs text-muted-foreground dark:text-muted-foreground">
              {error.message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
