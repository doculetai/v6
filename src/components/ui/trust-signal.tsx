'use client';

import { ShieldCheck } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';

type TrustSignalProps = {
  message: string;
  className?: string;
};

export function TrustSignal({ message, className }: TrustSignalProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5',
        className,
      )}
    >
      <ShieldCheck
        weight="duotone"
        className="mt-0.5 size-4 shrink-0 text-primary"
        aria-hidden="true"
      />
      <p className="text-xs leading-relaxed text-muted-foreground">{message}</p>
    </div>
  );
}
