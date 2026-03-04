'use client';

import { usePathname } from 'next/navigation';

import type { DashboardRole } from '@/config/roles';
import { cn } from '@/lib/utils';

import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

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
        'flex min-h-screen max-w-full overflow-x-hidden bg-background text-foreground',
        className,
      )}
    >
      {/* Desktop sidebar — sticky full-height, width managed by Sidebar itself */}
      <aside className="hidden h-screen lg:sticky lg:top-0 lg:flex lg:flex-none">
        <Sidebar role={role} currentPath={pathname} />
      </aside>

      {/* Main content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <TopBar role={role} currentPath={pathname} />

        <main className="min-w-0 flex-1 overflow-y-auto p-4 pb-24 md:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav (5 primary items) */}
      <BottomNav role={role} currentPath={pathname} />
    </div>
  );
}
