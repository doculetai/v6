'use client';

import { TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { adminCopy } from '@/config/copy/admin';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AnalyticsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('[analytics-error]', error);
  }, [error]);

  const copy = adminCopy.analytics.error;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-card p-10 text-center">
        <TriangleAlert className="size-8 text-destructive" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">{copy.title}</p>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset} className="min-h-11">
          {copy.retryLabel}
        </Button>
      </div>
    </div>
  );
}
