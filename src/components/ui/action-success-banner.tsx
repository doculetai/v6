'use client';

import { ArrowRight, CheckCircle, X } from '@/components/icons';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { JourneyNextAction } from '@/lib/journey/types';
import { primitivesCopy } from '@/config/copy/primitives';

interface ActionSuccessBannerProps {
  message: string;
  nextAction: JourneyNextAction | null;
  onDismiss?: () => void;
}

function ActionSuccessBanner({ message, nextAction, onDismiss }: ActionSuccessBannerProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <CheckCircle
            className="size-5 shrink-0 text-primary mt-0.5"
            weight="duotone"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{message}</p>
            {nextAction && (
              <p className="mt-0.5 text-sm text-muted-foreground">{nextAction.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {nextAction && (
            <Button asChild size="sm" variant="default">
              <Link href={nextAction.href} className="inline-flex items-center gap-1.5">
                {nextAction.cta}
                <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
              </Link>
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onDismiss}
              aria-label={primitivesCopy.ariaExtended.dismiss}
            >
              <X className="size-4" weight="duotone" aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { ActionSuccessBanner };
export type { ActionSuccessBannerProps };
