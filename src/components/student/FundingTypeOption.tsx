import { BadgeCheck } from 'lucide-react';

import { cn } from '@/lib/utils';

type FundingTypeOptionProps = {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
};

export function FundingTypeOption({
  title,
  description,
  selected,
  onSelect,
}: FundingTypeOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex min-h-11 w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'border-primary/40 bg-primary/10 dark:border-primary/40 dark:bg-primary/10'
          : 'border-border bg-background dark:border-border dark:bg-background',
      )}
      aria-pressed={selected}
    >
      <BadgeCheck
        className={cn(
          'mt-0.5 size-4 shrink-0',
          selected
            ? 'text-primary dark:text-primary'
            : 'text-muted-foreground dark:text-muted-foreground',
        )}
        aria-hidden="true"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground dark:text-foreground">{title}</span>
        <span className="block text-sm text-muted-foreground dark:text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}
