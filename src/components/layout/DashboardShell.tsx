'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { authPrimitives } from '@/config/copy/primitives/auth';
import type { DashboardRole } from '@/config/roles';
import type { StudentTrustStage } from '@/lib/student-trust-stage';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useMultiTabAuth } from '@/lib/hooks/useMultiTabAuth';
import { recordPageVisit } from '@/lib/hooks/useRecentPages';
import { useScrollRestoration } from '@/lib/hooks/useScrollRestoration';
import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout';
import { cn } from '@/lib/utils';

import { CommandPalette } from '@/components/ui/command-palette';

import { BottomNav } from './BottomNav';
import { RouteProgressBar } from './RouteProgressBar';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

type DashboardShellProps = {
  role: DashboardRole;
  children: React.ReactNode;
  className?: string;
  studentTrustStage?: StudentTrustStage;
};

export function DashboardShell({ role, children, className, studentTrustStage }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);

  const handleLogout = useCallback(() => {
    router.replace('/login');
  }, [router]);

  const { showWarning, remainingSeconds, dismiss } = useSessionTimeout(handleLogout);
  const { broadcastLogout } = useMultiTabAuth(handleLogout);
  useScrollRestoration(mainRef);
  useKeyboardShortcuts(role);

  // Page fade transition on route change
  const [contentVisible, setContentVisible] = useState(true);
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setContentVisible(false);
      // Allow CSS transition to start, then fade in
      const timer = setTimeout(() => setContentVisible(true), 20);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Record page visits for "Recent" sidebar section
  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] ?? 'Overview';
    const label = lastSegment === role
      ? 'Overview'
      : lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
    recordPageVisit(role, pathname, label);
  }, [pathname, role]);

  const copy = authPrimitives.sessionTimeout;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div
      className={cn(
        'flex h-screen overflow-hidden bg-background text-foreground',
        className,
      )}
    >
      {/* Desktop sidebar — locked to viewport height, never scrolls */}
      <aside className="hidden lg:flex lg:flex-none">
        <Sidebar role={role} currentPath={pathname} studentTrustStage={studentTrustStage} />
      </aside>

      {/* Main content column */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <RouteProgressBar />

        {/* Mobile topbar */}
        <TopBar role={role} currentPath={pathname} />

        <main
          ref={mainRef}
          className={cn(
            'min-w-0 flex-1 overflow-y-auto p-4 pb-24 transition-opacity duration-200 ease-out md:p-8 lg:pb-8',
            contentVisible ? 'opacity-100' : 'opacity-0',
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav (5 primary items) */}
      <BottomNav role={role} />

      {/* Command palette (Cmd+K) */}
      <CommandPalette role={role} />

      {/* Session timeout warning overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
            <h2 className="text-base font-semibold text-foreground">{copy.warningTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{copy.warningBody}</p>
            <p className="mt-3 text-center font-mono text-2xl font-bold text-foreground">
              {minutes}:{String(seconds).padStart(2, '0')}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  broadcastLogout();
                  handleLogout();
                }}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                {copy.signOut}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {copy.staySignedIn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
