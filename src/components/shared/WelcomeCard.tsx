'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X } from '@/components/icons';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type WelcomeStep = {
  label: string;
  description: string;
};

type WelcomeCardProps = {
  /** Unique key for localStorage persistence */
  storageKey: string;
  title: string;
  subtitle: string;
  steps: WelcomeStep[];
  dismissLabel: string;
};

export function WelcomeCard({
  storageKey,
  title,
  subtitle,
  steps,
  dismissLabel,
}: WelcomeCardProps) {
  const [dismissed, setDismissed] = useState(true); // Default hidden until hydrated

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored !== 'dismissed') {
      setDismissed(false);
    }
  }, [storageKey]);

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'dismissed');
    setDismissed(true);
  };

  return (
    <Card className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg text-foreground">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-8 shrink-0 p-0"
          onClick={handleDismiss}
          aria-label={dismissLabel}
        >
          <X className="size-4" weight="bold" aria-hidden="true" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-[44px]"
          onClick={handleDismiss}
        >
          <CheckCircle className="mr-1.5 size-4" weight="duotone" aria-hidden="true" />
          {dismissLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
