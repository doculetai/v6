'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
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
        className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border/60 bg-background/90 px-4 backdrop-blur-xl lg:hidden"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <Link
          href={`/dashboard/${role}`}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Image
            src="/brand/logos/logo.svg"
            alt={dashboardShellCopy.logoAlt}
            width={100}
            height={24}
            className="h-6 w-auto dark:hidden"
          />
          <Image
            src="/brand/logos/logo-dark.svg"
            alt={dashboardShellCopy.logoAlt}
            width={100}
            height={24}
            className="hidden h-6 w-auto dark:block"
          />
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
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <Image
                src="/brand/logos/logo.svg"
                alt="Doculet"
                width={100}
                height={24}
                className="h-6 w-auto dark:hidden"
              />
              <Image
                src="/brand/logos/logo-dark.svg"
                alt="Doculet"
                width={100}
                height={24}
                className="hidden h-6 w-auto dark:block"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
