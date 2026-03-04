'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[settings] error boundary caught:', error);
  }, [error]);

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-16 text-center">
        <AlertTriangle size={32} className="text-muted-foreground" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Failed to load settings</p>
          <p className="text-xs text-muted-foreground">
            Something went wrong. Try refreshing or contact support if this continues.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reset} className="min-h-[44px] gap-2">
          <RotateCcw size={16} aria-hidden="true" />
          Try again
        </Button>
      </div>
    </section>
  );
}
