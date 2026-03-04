'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { agentCopy } from '@/config/copy/agent';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ActivityError({ reset }: ErrorProps) {
  const copy = agentCopy.activity;

  return (
    <section className="mx-auto w-full max-w-2xl">
      <Card className="border-border bg-card dark:border-border dark:bg-card">
        <CardHeader className="space-y-3">
          <AlertTriangle className="size-5 text-destructive" />
          <CardTitle className="text-xl text-card-foreground dark:text-card-foreground">
            {copy.error.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            {copy.error.description}
          </p>
          <Button variant="outline" className="min-h-11" onClick={reset}>
            {copy.error.retryCta}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
