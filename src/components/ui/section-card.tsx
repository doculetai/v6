import * as React from 'react';

import { cn } from '@/lib/utils';

interface SectionCardAction {
  label: string;
  onClick?: () => void;
}

interface SectionCardProps extends React.ComponentPropsWithoutRef<'section'> {
  title: string;
  action?: SectionCardAction;
}

function SectionCard({ title, action, className, children, ...props }: SectionCardProps) {
  return (
    <section
      className={cn('rounded-xl border border-border bg-card shadow-xs', className)}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
          {title}
        </h2>
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            className="min-h-[44px] text-xs font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {action.label}
          </button>
        ) : null}
      </div>
      <div className="p-0">{children}</div>
    </section>
  );
}

export { SectionCard };
export type { SectionCardProps, SectionCardAction };
