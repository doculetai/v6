import * as React from 'react';

import { cn } from '@/lib/utils';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive';
}

const variantClasses: Record<NonNullable<ActionButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary:
    'border border-border bg-background text-foreground hover:bg-muted',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

function ActionButton({
  variant = 'primary',
  className,
  children,
  ...props
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { ActionButton };
export type { ActionButtonProps };
