'use client';

import { List, MagnifyingGlass, X } from '@/components/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { dashboardShellCopy } from '@/config/copy/dashboard-shell';
import { adminCopy } from '@/config/copy/admin';
import type { DashboardRole } from '@/config/roles';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

import { NotificationsBell } from './NotificationsBell';
import { Sidebar } from './Sidebar';

type TopBarProps = {
  role: DashboardRole;
  currentPath: string;
};

function AdminGlobalSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: results = [] } = trpc.admin.globalSearch.useQuery(
    { q: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 },
  );

  const showDropdown = open && debouncedQuery.length >= 2;

  return (
    <div ref={containerRef} className="relative hidden w-56 md:block">
      <div className="relative">
        <MagnifyingGlass
          size={16}
          weight="duotone"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={adminCopy.globalSearch.placeholder}
          className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={adminCopy.globalSearch.placeholder}
          aria-haspopup="listbox"
          aria-expanded={showDropdown}
        />
      </div>
      {showDropdown && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-md"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">No results</li>
          ) : (
            results.map((item) => (
              <li key={item.id} role="option" aria-selected={false}>
                <Link
                  href={item.href}
                  onClick={() => {
                    setOpen(false);
                    setQuery('');
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                  )}
                >
                  <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.type}
                  </span>
                  <span className="truncate text-foreground">{item.label}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

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

      {/* Desktop topbar — visible on lg+ where sidebar is shown */}
      {role === 'admin' && (
        <div className="hidden h-14 items-center border-b border-border bg-background px-6 lg:flex">
          <AdminGlobalSearch />
        </div>
      )}

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
