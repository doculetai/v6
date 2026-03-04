'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { universityCopy } from '@/config/copy/university';

interface OverviewErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const copy = universityCopy.overview.error;

export default function OverviewError({ error, reset }: OverviewErrorProps) {
  useEffect(() => {
    console.error('[university/overview] page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">{copy.heading}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{copy.body}</p>
      </div>
      <Button onClick={reset} variant="outline" className="min-h-11">
        {copy.retry}
      </Button>
    </div>
  );
}
