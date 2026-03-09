'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isActivePath } from '@/config/nav';
import type { DashboardRole } from '@/config/roles';
import type { Icon } from '@/components/icons';
import { cn } from '@/lib/utils';

type MobileTabItem = {
  href: string;
  label: string;
  icon: Icon;
};

type MobileTabBarProps = {
  items: MobileTabItem[];
  role: DashboardRole;
};

export function MobileTabBar({ items }: MobileTabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-end justify-around border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Mobile navigation"
    >
      {items.slice(0, 4).map((item) => {
        const isActive = isActivePath(item.href, pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              isActive ? '' : 'text-muted-foreground hover:text-foreground',
            )}
            style={isActive ? { color: 'var(--role-accent)' } : undefined}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-6 w-6" weight="duotone" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
