'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sponsorCopy } from '@/config/copy/sponsor';

export default function TransactionsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="mx-auto w-full max-w-3xl border-border bg-card dark:border-border dark:bg-card">
      <CardHeader className="space-y-3">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <CardTitle className="text-xl text-foreground dark:text-foreground">
          {sponsorCopy.transactions.error.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
          {sponsorCopy.transactions.error.description}
        </p>
        <Button type="button" onClick={reset} className="min-h-11">
          {sponsorCopy.transactions.error.retry}
        </Button>
      </CardContent>
    </Card>
  );
}
