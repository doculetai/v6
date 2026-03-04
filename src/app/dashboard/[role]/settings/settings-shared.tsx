'use client';

import { CheckCircle2 } from 'lucide-react';

export function FormErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:border-destructive/40 dark:bg-destructive/15"
    >
      {message}
    </p>
  );
}

export function FormSuccessBanner({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="flex items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
    >
      <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
