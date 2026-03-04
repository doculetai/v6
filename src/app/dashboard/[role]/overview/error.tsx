'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { dashboardShellCopy } from '@/config/copy/dashboard-shell';

type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AgentOverviewError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-card p-8 text-center">
        <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-card-foreground">
            {dashboardShellCopy.overview.errorTitle}
          </h2>
          <p className="text-sm text-muted-foreground">
            {dashboardShellCopy.overview.errorDescription}
          </p>
        </div>
        <Button onClick={reset} variant="outline" className="min-h-11">
          {dashboardShellCopy.overview.errorRetryCta}
        </Button>
      </div>
    </section>
  );
}
