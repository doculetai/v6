import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between pb-3 border-b border-border mb-5', className)}>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {action != null && (
        <div className="flex items-center gap-2">{action}</div>
      )}
    </div>
  );
}
