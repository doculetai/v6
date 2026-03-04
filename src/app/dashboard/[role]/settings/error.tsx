'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { agentCopy } from '@/config/copy/agent';

export default function SettingsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card className="border-border bg-card dark:border-border dark:bg-card">
        <CardHeader className="space-y-3">
          <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
          <CardTitle className="text-lg text-card-foreground">
            {agentCopy.settings.errors.loadError}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="min-h-11" onClick={reset}>
            {agentCopy.settings.errors.tryAgain}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
