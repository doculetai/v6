'use client';

import { Menu, Shield, X } from 'lucide-react';
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
        className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border/60 bg-background/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden"
      >
        <Link
          href={`/dashboard/${role}`}
          className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={dashboardShellCopy.logoAlt}
        >
          <Shield className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="text-sm font-bold tracking-tight text-foreground">Doculet</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu className="size-5" />
        </button>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3">
              <div className="flex items-center gap-2">
                <Shield className="size-5 shrink-0 text-sidebar-foreground" aria-hidden="true" />
                <span className="text-sm font-bold tracking-tight text-sidebar-foreground">Doculet</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar role={role} currentPath={currentPath} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
