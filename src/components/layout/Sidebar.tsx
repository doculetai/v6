'use client';

import { createBrowserClient } from '@supabase/ssr';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { dashboardShellCopy, roleDisplayNames } from '@/config/copy/dashboard-shell';
import { getNavItems, isActivePath } from '@/config/nav';
import type { DashboardRole } from '@/config/roles';
import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';

type SidebarProps = {
  role: DashboardRole;
};

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function Sidebar({ role }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const navItems = getNavItems(role);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      await supabase.auth.signOut();
    } finally {
      router.push('/login');
      router.refresh();
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-card text-card-foreground dark:border-border dark:bg-card dark:text-card-foreground">
      <div className="px-4 pb-4 pt-6">
        <Link
          href={`/dashboard/${role}`}
          className="inline-flex min-h-11 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Image
            src="/brand/logos/logo.svg"
            alt={dashboardShellCopy.logoAlt}
            width={132}
            height={32}
            priority
            className="h-auto w-auto dark:hidden"
          />
          <Image
            src="/brand/logos/logo-dark.svg"
            alt={dashboardShellCopy.logoAlt}
            width={132}
            height={32}
            priority
            className="hidden h-auto w-auto dark:block"
          />
        </Link>
      </div>

      <nav aria-label={dashboardShellCopy.sidebar.navAriaLabel} className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.href, pathname);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium dark:bg-primary/10 dark:text-primary'
                      : 'text-muted-foreground dark:text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground',
                  )}
                >
                  <Icon className="size-6 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-4 dark:border-border">
        <div className="mb-3 flex min-h-11 items-center gap-3 rounded-lg bg-background px-3 py-2 dark:bg-background">
          <Avatar size="sm">
            <AvatarFallback>{dashboardShellCopy.sidebar.avatarFallback}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground dark:text-foreground">
              {`${roleDisplayNames[role]} ${dashboardShellCopy.sidebar.fallbackUserNameSuffix}`}
            </p>
            <p className="truncate text-xs text-muted-foreground dark:text-muted-foreground">
              {`${roleDisplayNames[role]} ${dashboardShellCopy.sidebar.accountLabel}`}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          disabled={isSigningOut}
          className="min-h-11 w-full justify-start gap-2 text-sm"
        >
          <LogOut className="size-5" aria-hidden="true" />
          <span>{dashboardShellCopy.sidebar.logoutLabel}</span>
        </Button>
      </div>
    </div>
  );
}
