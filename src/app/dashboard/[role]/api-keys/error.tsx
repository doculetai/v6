'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { partnerCopy } from '@/config/copy/partner';

interface ApiKeysErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ApiKeysError({ error, reset }: ApiKeysErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <h2 className="mt-4 text-base font-semibold text-foreground">
        {partnerCopy.errors.generic}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{partnerCopy.errors.tryAgain}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={reset}>
        {partnerCopy.errors.retryLabel}
      </Button>
    </div>
  );
}
