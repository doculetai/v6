'use client';

import { AlertTriangle } from 'lucide-react';
import { captureException } from '@sentry/nextjs';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { commonErrors } from '@/config/copy/shared';

export default function ApiKeysError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{commonErrors.generic}</p>
      </div>
      <Button variant="outline" onClick={reset} className="min-h-11">
        {commonErrors.tryAgain}
      </Button>
    </div>
  );
}
