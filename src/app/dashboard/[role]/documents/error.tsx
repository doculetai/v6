'use client';

import { AlertTriangle } from 'lucide-react';

import { universityCopy } from '@/config/copy/university';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function DocumentsError({ reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-card p-8 text-center">
      <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {universityCopy.errors.generic}
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
      >
        {universityCopy.documents.tryAgain}
      </button>
    </div>
  );
}
