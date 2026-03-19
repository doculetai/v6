'use client';

import dynamic from 'next/dynamic';
import { List, MagnifyingGlass, X } from '@/components/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { dashboardShellCopy } from '@/config/copy/dashboard-shell';
import { primitivesCopy } from '@/config/copy/primitives';
import type { DashboardRole } from '@/config/roles';

import { NotificationsBell } from './NotificationsBell';

// Desktop bell is client-only to prevent duplicate Radix useId() from causing
// a server/client hydration mismatch when both responsive layouts are in the DOM.
const NotificationsBellDesktop = dynamic(
  () => import('./NotificationsBell').then((m) => ({ default: m.NotificationsBell })),
  { ssr: false },
);
import { Sidebar } from './Sidebar';

type TopBarProps = {
  role: DashboardRole;
  currentPath: string;
  user?: { fullName: string | null; email: string | null };
};

function getInitials(user?: { fullName: string | null; email: string | null }): string {
  if (user?.fullName) {
    const parts = user.fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  if (user?.email) {
    return user.email[0].toUpperCase();
  }
  return 'U';
}

function getPageLabel(currentPath: string, role: DashboardRole): string {
  const segments = currentPath.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  if (!lastSegment || lastSegment === role) return 'Overview';
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
}

function triggerCommandPalette() {
  const event = new KeyboardEvent('keydown', {
    key: 'k',
    metaKey: true,
    bubbles: true,
  });
  document.dispatchEvent(event);
}

export function TopBar({ role, currentPath, user }: TopBarProps) {
  const [open, setOpen] = useState(false);
  const pageLabel = getPageLabel(currentPath, role);
  const initials = getInitials(user);

  return (
    <>
      {/* Mobile header — hidden on lg+ where sidebar is visible */}
      <header
        className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background px-4 pt-[env(safe-area-inset-top)] lg:hidden"
      >
        <Link
          href={`/dashboard/${role}`}
          className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={dashboardShellCopy.logoAlt}
        >
          <Image
            src="/brand/assets/logo/doculet-shield-64.png"
            alt=""
            width={64}
            height={64}
            className="size-8 shrink-0"
            aria-hidden="true"
          />
          <span className="text-sm font-bold tracking-tight text-primary">{dashboardShellCopy.brandName}</span>
        </Link>

        <div className="flex items-center gap-1">
          <NotificationsBell role={role} />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={dashboardShellCopy.topbar.openMenu}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <List className="size-5" weight="duotone" />
          </button>
        </div>
      </header>

      {/* Desktop topbar — visible on lg+ for all roles */}
      <div className="hidden h-[58px] items-center gap-3 border-b border-border bg-background px-7 lg:flex">
        {/* Breadcrumb */}
        <nav aria-label={primitivesCopy.ariaExtended.breadcrumbNav} className="flex items-center gap-1.5 text-[13px] font-medium text-foreground/40">
          <span>{dashboardShellCopy.topbar.breadcrumbRoot}</span>
          <span>/</span>
          <span className="font-semibold text-foreground">{pageLabel}</span>
        </nav>

        {/* Search trigger — opens CommandPalette via ⌘K */}
        <button
          type="button"
          onClick={triggerCommandPalette}
          className="mx-auto flex h-[34px] w-full max-w-[300px] cursor-text items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 text-[13px] text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={dashboardShellCopy.topbar.searchPlaceholder}
        >
          <MagnifyingGlass className="size-3.5 shrink-0" weight="duotone" aria-hidden="true" />
          <span className="flex-1 text-left">{dashboardShellCopy.topbar.searchPlaceholder}</span>
          <kbd className="hidden rounded bg-muted px-[5px] py-0.5 font-mono text-[10px] text-muted-foreground/60 md:block">
            ⌘K
          </kbd>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-[6px]">
          <NotificationsBellDesktop role={role} />
          <button
            type="button"
            aria-label={dashboardShellCopy.topbar.userMenu}
            style={{
              backgroundColor: 'var(--role-accent)',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.8), 0 0 0 3px rgba(0,0,0,0.10)',
            }}
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold tracking-[-0.02em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {initials}
          </button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">{dashboardShellCopy.topbar.navMenu}</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/brand/assets/logo/doculet-shield-64.png"
                  alt=""
                  width={64}
                  height={64}
                  className="size-7 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm font-bold tracking-tight text-sidebar-foreground">{dashboardShellCopy.brandName}</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dashboardShellCopy.topbar.closeMenu}
                className="rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                <X className="size-4" weight="duotone" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar role={role} currentPath={currentPath} forceVisible />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
