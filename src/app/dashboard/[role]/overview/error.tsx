'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { partnerCopy } from '@/config/copy/partner';

interface OverviewErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OverviewError({ reset }: OverviewErrorProps) {
  const copy = partnerCopy.errors;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="mb-4 size-10 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-foreground">{copy.generic}</h2>
      <Button
        variant="outline"
        size="sm"
        onClick={reset}
        className="mt-6 min-h-11"
      >
        {copy.retry}
      </Button>
    </div>
  );
}
