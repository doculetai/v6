'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { partnerCopy } from '@/config/copy/partner';

interface AnalyticsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const copy = partnerCopy.analytics.error;

export default function AnalyticsError({ reset }: AnalyticsErrorProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-card p-6 text-center">
      <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{copy.title}</p>
        <p className="text-sm text-muted-foreground">{copy.description}</p>
      </div>
      <Button variant="outline" size="sm" onClick={reset} className="min-h-11">
        {copy.retry}
      </Button>
    </div>
  );
}
