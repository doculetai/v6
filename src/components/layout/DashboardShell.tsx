'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { DashboardRole } from '@/config/roles';
import type { StudentTrustStage } from '@/lib/student-trust-stage';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useMultiTabAuth } from '@/lib/hooks/useMultiTabAuth';
import { recordPageVisit } from '@/lib/hooks/useRecentPages';
import { useScrollRestoration } from '@/lib/hooks/useScrollRestoration';
import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout';
import { cn } from '@/lib/utils';

import { CommandPalette } from '@/components/ui/command-palette';
import { SessionTimeoutSheet } from '@/components/ui/session-timeout-sheet';

import { BottomNav } from './BottomNav';
import { RouteProgressBar } from './RouteProgressBar';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { routes } from '@/config/routes';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

type DashboardShellProps = {
  role: DashboardRole;
  children: React.ReactNode;
  className?: string;
  studentTrustStage?: StudentTrustStage;
  impersonating?: { name: string; onExit: () => void } | null;
};

export function DashboardShell({ role, children, className, studentTrustStage, impersonating }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);

  const handleLogout = useCallback(() => {
    router.replace(routes.auth.login);
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

  return (
    <div
      className={cn(
        'flex h-screen overflow-hidden bg-background text-foreground',
        className,
      )}
    >
      {/* Sidebar — visible from tablet (768px); collapsed by default at 768–1024px */}
      <aside className="hidden md:flex md:flex-none">
        <Sidebar role={role} currentPath={pathname} studentTrustStage={studentTrustStage} />
      </aside>

      {/* Main content column */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <RouteProgressBar />

        {/* Impersonation banner (admin only, opt-in via prop) */}
        {impersonating && (
          <ImpersonationBanner
            studentName={impersonating.name}
            onExit={impersonating.onExit}
          />
        )}

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

      {/* Session timeout warning sheet */}
      <SessionTimeoutSheet
        open={showWarning}
        remainingSeconds={remainingSeconds}
        onDismiss={dismiss}
        onSignOut={() => {
          broadcastLogout();
          handleLogout();
        }}
      />
    </div>
  );
}
