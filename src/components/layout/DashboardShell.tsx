'use client';

import { usePathname } from 'next/navigation';

import type { DashboardRole } from '@/config/roles';
import { cn } from '@/lib/utils';

import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

type DashboardShellProps = {
  role: DashboardRole;
  children: React.ReactNode;
  className?: string;
};

export function DashboardShell({ role, children, className }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'flex min-h-screen max-w-full overflow-x-hidden bg-background text-foreground dark:bg-background dark:text-foreground',
        className,
      )}
    >
      <aside className="hidden lg:block lg:h-screen lg:w-[240px] lg:flex-none">
        <Sidebar role={role} currentPath={pathname} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-w-0 flex-1 overflow-y-auto p-4 pb-24 md:p-8 lg:pb-8">{children}</main>
      </div>

      <BottomNav role={role} currentPath={pathname} />
    </div>
  );
}
