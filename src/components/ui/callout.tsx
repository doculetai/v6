import { Warning, Info, CheckCircle, XCircle } from '@/components/icons';
import { cn } from '@/lib/utils';

type CalloutVariant = 'warning' | 'info' | 'success' | 'error';

const variantConfig: Record<
  CalloutVariant,
  { classes: string; Icon: typeof Warning }
> = {
  warning: {
    classes:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300',
    Icon: Warning,
  },
  info: {
    classes:
      'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300',
    Icon: Info,
  },
  success: {
    classes:
      'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300',
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
