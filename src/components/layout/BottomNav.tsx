'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { dashboardShellCopy } from '@/config/copy/dashboard-shell';
import { getNavItems, getMobileNavKey, isActivePath, mobileNavKeys } from '@/config/nav';
import type { DashboardRole } from '@/config/roles';
import { cn } from '@/lib/utils';

type BottomNavProps = {
  role: DashboardRole;
};

const gridColumnsByCount: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const allItems = getNavItems(role);
  const keys = mobileNavKeys[role];

  // Filter nav items to the 4 curated mobile keys, preserving key order.
  const items = keys
    .map((key) => allItems.find((item) => getMobileNavKey(item.href, role) === key))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  const gridClass = gridColumnsByCount[items.length] ?? gridColumnsByCount[4];

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
          const isActive = isActivePath(item.href, pathname);

          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                className={cn(
                  'relative flex min-h-[44px] w-full flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-xs leading-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground',
                )}
                style={
                  isActive
                    ? {
                        color: 'var(--role-accent)',
                        backgroundColor: 'var(--role-accent-bg)',
                      }
                    : undefined
                }
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="size-6" weight="duotone" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 ? (
                  <span
                    className="absolute right-1 top-1 rounded-full px-1.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: 'var(--role-accent)', color: '#fff' }}
                  >
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
