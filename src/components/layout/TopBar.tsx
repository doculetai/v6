'use client';

import { List, MagnifyingGlass, X } from '@/components/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { dashboardShellCopy } from '@/config/copy/dashboard-shell';
import { ROLE_ACCENTS, type DashboardRole } from '@/config/roles';

import { NotificationsBell } from './NotificationsBell';
import { Sidebar } from './Sidebar';

type TopBarProps = {
  role: DashboardRole;
  currentPath: string;
};

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

export function TopBar({ role, currentPath }: TopBarProps) {
  const [open, setOpen] = useState(false);
  const pageLabel = getPageLabel(currentPath, role);
  const accentHex = ROLE_ACCENTS[role].text;

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
      <div className="hidden h-14 items-center gap-3 border-b border-border bg-background px-7 lg:flex">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-medium text-foreground">{pageLabel}</span>
        </nav>

        {/* Search trigger — opens CommandPalette via ⌘K */}
        <button
          type="button"
          onClick={triggerCommandPalette}
          className="flex h-[34px] flex-1 max-w-[300px] mx-auto items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 text-[13px] text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={dashboardShellCopy.topbar.searchPlaceholder}
        >
          <MagnifyingGlass className="size-4 shrink-0" weight="duotone" aria-hidden="true" />
          <span className="flex-1 text-left">{dashboardShellCopy.topbar.searchPlaceholder}</span>
          <kbd className="hidden rounded border border-border bg-background px-1 py-0.5 text-[10px] font-medium md:block">
            ⌘K
          </kbd>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <NotificationsBell role={role} />
          <button
            type="button"
            aria-label="User menu"
            style={{ backgroundColor: accentHex }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {dashboardShellCopy.sidebar.avatarFallback}
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
