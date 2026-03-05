'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { adminCopy } from '@/config/copy/admin';

export default function TransactionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <AlertTriangle className="size-12 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold text-foreground dark:text-foreground">
          {adminCopy.errors.generic}
        </p>
        {error.message && (
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            {error.message}
          </p>
        )}
      </div>
      <Button variant="outline" onClick={reset} className="min-h-11">
        Try again
      </Button>
    </div>
  );
}
