'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { dashboardShellCopy } from '@/config/copy/dashboard-shell';
import { getNavItems, isActivePath } from '@/config/nav';
import type { DashboardRole } from '@/config/roles';
import { cn } from '@/lib/utils';

type BottomNavProps = {
  role: DashboardRole;
  currentPath?: string;
};

const gridColumnsByCount: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

export function BottomNav({ role, currentPath }: BottomNavProps) {
  const pathname = usePathname();
  const activePath = currentPath ?? pathname;
  const items = getNavItems(role).slice(0, 5);
  const gridClass = gridColumnsByCount[items.length] ?? gridColumnsByCount[5];

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={dashboardShellCopy.bottomNav.navAriaLabel}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur lg:hidden dark:border-border dark:bg-card/95"
    >
      <ul className={cn('mx-auto grid max-w-screen-sm gap-1', gridClass)}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.href, activePath);

          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                className={cn(
                  'relative flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-xs leading-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium dark:bg-primary/10 dark:text-primary'
                    : 'text-muted-foreground dark:text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground',
                )}
              >
                <Icon className="size-6" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute right-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground dark:bg-primary dark:text-primary-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
