'use client';

import { createBrowserClient } from '@supabase/ssr';
import { ChevronDown, LogOut, PanelLeftClose } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  dashboardShellCopy,
  getFallbackUserName,
  roleDisplayNames,
} from '@/config/copy/dashboard-shell';
import { getNavConfig } from '@/config/nav';
import type { NavItem } from '@/config/nav/types';
import type { DashboardRole } from '@/config/roles';
import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type SidebarProps = {
  role: DashboardRole;
  currentPath: string;
  defaultCollapsed?: boolean;
};

// Longest-prefix-wins active matching
function findBestMatch(items: NavItem[], currentPath: string): string | null {
  let best: NavItem | null = null;
  for (const item of items) {
    if (currentPath === item.href || currentPath.startsWith(`${item.href}/`)) {
      if (!best || item.href.length > best.href.length) best = item;
    }
    if (item.children) {
      for (const child of item.children) {
        if (currentPath === child.href || currentPath.startsWith(`${child.href}/`)) {
          if (!best || child.href.length > best.href.length) best = child;
        }
      }
    }
  }
  return best?.href ?? null;
}

export function Sidebar({ role, currentPath, defaultCollapsed = false }: SidebarProps) {
  const router = useRouter();
  const navConfig = getNavConfig(role);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const activeHref = useMemo(
    () => findBestMatch(navConfig.items, currentPath),
    [navConfig.items, currentPath],
  );

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  }, []);

  const handleLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await supabase?.auth.signOut();
    } finally {
      router.push('/login');
      router.refresh();
      setIsSigningOut(false);
    }
  };

  const ungroupedItems = navConfig.items.filter((item) => !item.group);
  const groupedItems = navConfig.groups
    .map((group) => ({
      group,
      items: navConfig.items.filter((item) => item.group === group.id),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'flex h-full flex-col border-r border-border/50 bg-muted/60 transition-[width] duration-200 ease-out dark:bg-card',
          isCollapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* ── Header: Logo + Collapse Toggle ── */}
        <div className="flex shrink-0 items-center border-b border-border/50 px-3 h-16">
          {!isCollapsed && (
            <Link
              href={`/dashboard/${role}`}
              className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image
                src="/brand/logos/logo.svg"
                alt={dashboardShellCopy.logoAlt}
                width={140}
                height={32}
                priority
                className="h-8 w-auto dark:hidden"
              />
              <Image
                src="/brand/logos/logo-dark.svg"
                alt={dashboardShellCopy.logoAlt}
                width={140}
                height={32}
                priority
                className="hidden h-8 w-auto dark:block"
              />
            </Link>
          )}
          {isCollapsed && (
            <Link
              href={`/dashboard/${role}`}
              className="mx-auto rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image
                src="/brand/logos/doculet-shield.svg"
                alt="Doculet"
                width={36}
                height={36}
                className="size-9"
              />
            </Link>
          )}
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              aria-label="Collapse sidebar"
              className="ml-auto rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <PanelLeftClose className="size-4" />
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav
          aria-label={dashboardShellCopy.sidebar.navAriaLabel}
          className="flex-1 overflow-hidden py-2"
        >
          {/* Ungrouped items (e.g. Overview) */}
          {ungroupedItems.length > 0 && (
            <ul className="flex flex-col gap-0.5 px-3 pb-1" role="list">
              {ungroupedItems.map((item) => (
                <li key={item.href}>
                  <NavItemLink
                    item={item}
                    isActive={activeHref === item.href}
                    isCollapsed={isCollapsed}
                    activeHref={activeHref}
                  />
                </li>
              ))}
            </ul>
          )}

          {/* Grouped items — V5 style: separator + collapsible label */}
          {groupedItems.map(({ group, items }) => (
            <NavGroup
              key={group.id}
              label={group.label}
              items={items}
              activeHref={activeHref}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* ── Footer: User + Logout ── */}
        <div
          className="flex shrink-0 flex-col gap-1.5 border-t border-border/50 pt-2 pb-3"
          data-testid="sidebar-bottom"
        >
          {isCollapsed ? (
            <>
              <div className="flex justify-center px-3">
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {dashboardShellCopy.sidebar.avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isSigningOut}
                    className="mx-3 flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={dashboardShellCopy.sidebar.logoutLabel}
                  >
                    <LogOut className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{dashboardShellCopy.sidebar.logoutLabel}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsCollapsed(false)}
                    aria-label="Expand sidebar"
                    className="mx-3 flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <PanelLeftClose className="size-4 rotate-180" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-muted/30">
              <Avatar size="sm">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {dashboardShellCopy.sidebar.avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-foreground">
                  {getFallbackUserName(role)}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {roleDisplayNames[role]}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isSigningOut}
                aria-label={dashboardShellCopy.sidebar.logoutLabel}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── NavGroup — collapsible group section (V5 style) ──────────────────────────
type NavGroupProps = {
  label: string;
  items: NavItem[];
  activeHref: string | null;
  isCollapsed: boolean;
};

function NavGroup({ label, items, activeHref, isCollapsed }: NavGroupProps) {
  const hasActive = items.some((i) => i.href === activeHref);
  const [isOpen, setIsOpen] = useState(true);

  if (isCollapsed) {
    return (
      <div className="py-0.5">
        <div role="separator" className="mx-3 border-t border-border/50" />
        <ul className="mt-0.5 flex flex-col gap-0.5 px-3" role="list">
          {items.map((item) => (
            <li key={item.href}>
              <NavItemLink item={item} isActive={activeHref === item.href} isCollapsed={true} activeHref={activeHref} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mb-0.5 py-0.5">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-md"
        aria-expanded={isOpen}
      >
        {label}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-200', !isOpen && '-rotate-90')}
        />
      </button>
      <ul
        className={cn(
          'flex flex-col gap-0.5 overflow-hidden px-3 transition-all duration-200',
          isOpen ? 'max-h-96 opacity-100' : 'invisible max-h-0 opacity-0',
        )}
        role="list"
      >
        {items.map((item) => (
          <li key={item.href}>
            <NavItemLink item={item} isActive={activeHref === item.href} isCollapsed={false} activeHref={activeHref} />
          </li>
        ))}
      </ul>
    </div>
  );
}

void NavGroup; // suppress unused warning if linter complains — it's used above

// ── NavItemLink — compact h-8 item with left accent bar (V5 style) ───────────
type NavItemLinkProps = {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  activeHref: string | null;
};

function NavItemLink({ item, isActive, isCollapsed, activeHref }: NavItemLinkProps) {
  void activeHref;
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? item.label : undefined}
      className={cn(
        'group relative flex h-8 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150',
        'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive && 'bg-primary/15 font-semibold',
        isCollapsed && 'justify-center px-0',
      )}
    >
      {/* Left accent bar */}
      <span
        className={cn(
          'absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200',
          isActive ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0',
        )}
      />

      {/* Icon wrapper */}
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center transition-transform group-hover:scale-110 motion-reduce:group-hover:scale-100">
        <Icon className="h-5 w-5" aria-hidden="true" />
        {item.badge !== undefined && item.badge > 0 && isCollapsed && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
      </span>

      {/* Label */}
      {!isCollapsed && (
        <span className="truncate">{item.label}</span>
      )}

      {/* Badge (expanded) */}
      {item.badge !== undefined && item.badge > 0 && !isCollapsed && (
        <span className={cn(
          'ml-auto flex items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground',
          item.badge > 9 ? 'h-5 min-w-5 px-1' : 'h-4 w-4',
        )}>
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="flex flex-col gap-0.5">
          <span className="font-medium">{item.label}</span>
          {item.description && (
            <span className="text-xs text-muted-foreground">{item.description}</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
