'use client';

import { useEffect } from 'react';

import { captureException } from '@sentry/nextjs';

import { Button } from '@/components/ui/button';
import { partnerCopy } from '@/config/copy/partner';
import { commonErrors } from '@/config/copy/shared';

export default function WebhooksError({
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
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{partnerCopy.webhooks.error.title}</p>
        <p className="text-sm text-muted-foreground">{partnerCopy.webhooks.error.description}</p>
      </div>
      <Button variant="outline" onClick={reset} className="min-h-11">
        {commonErrors.tryAgain}
      </Button>
    </div>
  );
}
