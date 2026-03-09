import { Warning, Info, CheckCircle, XCircle } from '@/components/icons';
import { cn } from '@/lib/utils';

type CalloutVariant = 'warning' | 'info' | 'success' | 'error';

const variantConfig: Record<
  CalloutVariant,
  { classes: string; Icon: typeof Warning }
> = {
  warning: {
    classes: 'border-warning/30 bg-warning/10 text-warning',
    Icon: Warning,
  },
  info: {
    classes: 'border-primary/30 bg-primary/10 text-primary',
    Icon: Info,
  },
  success: {
    classes: 'border-success/30 bg-success/10 text-success',
    Icon: CheckCircle,
  },
  error: {
    classes: 'border-destructive/30 bg-destructive/5 text-destructive',
    Icon: XCircle,
  },
};

interface CalloutProps {
  variant?: CalloutVariant;
  children: React.ReactNode;
  className?: string;
}

export function Callout({ variant = 'warning', children, className }: CalloutProps) {
  const { classes, Icon } = variantConfig[variant];
  return (
    <div className={cn('flex gap-3 rounded-xl border px-4 py-3 text-sm', classes, className)}>
      <Icon size={16} weight="duotone" className="mt-0.5 shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export type { CalloutVariant, CalloutProps };
