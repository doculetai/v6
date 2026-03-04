'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { agentCopy } from '@/config/copy/agent';

interface CommissionsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CommissionsError({ error, reset }: CommissionsErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-card p-8 text-center">
      <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{agentCopy.errors.generic}</p>
      <Button variant="outline" size="sm" onClick={reset} className="min-h-11">
        {agentCopy.errors.retry}
      </Button>
    </div>
  );
}
