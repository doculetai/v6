import Link from 'next/link';

import { LockKey } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlockedStateCardProps {
  heading: string;
  body: string;
  action: { label: string; href: string };
  icon?: React.ReactNode;
  className?: string;
}

export function BlockedStateCard({ heading, body, action, icon, className }: BlockedStateCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        {icon ?? <LockKey size={24} weight="duotone" className="text-muted-foreground" />}
      </div>
      <h2 className="text-base font-semibold text-foreground">{heading}</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{body}</p>
      <Button asChild className="mt-6">
        <Link href={action.href}>{action.label}</Link>
      </Button>
    </div>
  );
}

export type { BlockedStateCardProps };
