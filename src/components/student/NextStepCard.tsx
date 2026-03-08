'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle } from '@/components/icons';

import { uiPrimitives } from '@/config/copy/primitives';
import { cn } from '@/lib/utils';

interface NextStepCardProps {
  title: string;
  body: string;
  cta: string;
  href: string;
  completed?: boolean;
  onDismiss?: () => void;
}

export function NextStepCard({
  title,
  body,
  cta,
  href,
  completed = false,
  onDismiss,
}: NextStepCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 transition-colors',
        completed && 'border-success/20 bg-success/5',
      )}
    >
      <div className="flex items-start gap-3">
        {completed ? (
          <CheckCircle weight="duotone" className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        ) : (
          <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
        )}

        <div className="flex-1 space-y-1">
          <p className={cn(
            'text-sm font-medium',
            completed ? 'text-success' : 'text-foreground',
          )}>
            {title}
          </p>
          <p className="text-xs text-muted-foreground">{body}</p>

          {!completed && (
            <Link
              href={href}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {cta}
              <ArrowRight weight="duotone" className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {onDismiss && !completed && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-xs text-muted-foreground hover:text-foreground"
            aria-label={uiPrimitives.labels.dismiss}
          >
            {uiPrimitives.labels.dismiss}
          </button>
        )}
      </div>
    </div>
  );
}
