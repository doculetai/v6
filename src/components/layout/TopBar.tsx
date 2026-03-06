'use client';

import { List, X } from '@phosphor-icons/react';
import Image from 'next/image';

import { NotificationsBell } from './NotificationsBell';
import Link from 'next/link';
import { useState } from 'react';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { dashboardShellCopy } from '@/config/copy/dashboard-shell';
import type { DashboardRole } from '@/config/roles';

import { Sidebar } from './Sidebar';

type TopBarProps = {
  role: DashboardRole;
  currentPath: string;
};

export function TopBar({ role, currentPath }: TopBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
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
          <span className="text-sm font-bold tracking-tight text-foreground">{dashboardShellCopy.brandName}</span>
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
