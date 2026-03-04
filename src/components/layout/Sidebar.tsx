'use client';

import { createBrowserClient } from '@supabase/ssr';
import { ChevronDown, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { dashboardShellCopy } from '@/config/copy/dashboard-shell';
import { getNavConfig } from '@/config/nav';
import type { NavItem } from '@/config/nav/types';
import type { DashboardRole } from '@/config/roles';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { RoleIndicator } from './sidebar/RoleIndicator';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { SidebarQuickAction } from './sidebar/SidebarQuickAction';
import { SidebarToggle } from './sidebar/SidebarToggle';
import { SidebarUserCard } from './sidebar/SidebarUserCard';

type SidebarProps = {
  role: DashboardRole;
  currentPath: string;
  defaultCollapsed?: boolean;
};

function findBestMatch(items: NavItem[], currentPath: string): string | null {
  let best: NavItem | null = null;
  for (const item of items) {
    if (currentPath === item.href || currentPath.startsWith(`${item.href}/`)) {
      if (!best || item.href.length > best.href.length) best = item;
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

  const ungroupedItems = navConfig.items.filter((i) => !i.group);
  const groupedItems = navConfig.groups
    .map((group) => ({ group, items: navConfig.items.filter((i) => i.group === group.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg print:hidden',
          'transition-[width] duration-200 ease-out',
          isCollapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* ── Top: Logo + RoleIndicator + QuickAction ── */}
        <div className="flex shrink-0 flex-col gap-1.5 pb-2 pt-3">
          <div className={cn('px-4', isCollapsed && 'flex justify-center px-3')}>
            <Link
              href={`/dashboard/${role}`}
              className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              aria-label={dashboardShellCopy.logoAlt}
            >
              <Shield className="size-6 shrink-0 text-sidebar-foreground" aria-hidden="true" />
              {!isCollapsed && (
                <span className="text-base font-bold tracking-tight text-sidebar-foreground">
                  Doculet
                </span>
              )}
            </Link>
          </div>

          <RoleIndicator role={role} isCollapsed={isCollapsed} />
          <SidebarQuickAction
            label={navConfig.quickAction.label}
            icon={navConfig.quickAction.icon}
            href={navConfig.quickAction.href}
            isCollapsed={isCollapsed}
          />
        </div>

        {/* ── Nav ── */}
        <nav
          aria-label={dashboardShellCopy.sidebar.navAriaLabel}
          className="flex-1 overflow-y-auto py-1"
        >
          {ungroupedItems.length > 0 && (
            <ul className="flex flex-col gap-0.5 px-3" role="list">
              {ungroupedItems.map((item) => (
                <li key={item.href}>
                  <NavItemLink item={item} isActive={activeHref === item.href} isCollapsed={isCollapsed} />
                </li>
              ))}
            </ul>
          )}

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

        {/* ── Bottom: Toggle + UserCard + Footer ── */}
        <div
          className="flex shrink-0 flex-col gap-1.5 border-t border-sidebar-border pt-2"
          data-testid="sidebar-bottom"
        >
          <div className={cn('px-3', isCollapsed && 'px-2')}>
            <SidebarToggle isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((v) => !v)} />
          </div>
          <SidebarUserCard role={role} isCollapsed={isCollapsed} onSignOut={handleLogout} />
          <SidebarFooter isCollapsed={isCollapsed} />
        </div>
      </aside>
    </TooltipProvider>
  );
}

// ── NavGroup ──────────────────────────────────────────────────────────────────
type NavGroupProps = {
  label: string;
  items: NavItem[];
  activeHref: string | null;
  isCollapsed: boolean;
};

function NavGroup({ label, items, activeHref, isCollapsed }: NavGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (isCollapsed) {
    return (
      <div className="mb-0.5 py-0.5">
        <div role="separator" className="mx-3 border-t border-sidebar-border" />
        <ul className="mt-0.5 flex flex-col gap-0.5 px-3" role="list">
          {items.map((item) => (
            <li key={item.href}>
              <NavItemLink item={item} isActive={activeHref === item.href} isCollapsed={true} />
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
        className="flex w-full items-center justify-between px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:rounded-md"
        aria-expanded={isOpen}
      >
        {label}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', !isOpen && '-rotate-90')}
        />
      </button>
      <ul
        className={cn(
          'flex flex-col gap-0.5 overflow-hidden px-3 transition-all',
          isOpen ? 'max-h-[500px] opacity-100' : 'invisible max-h-0 opacity-0',
        )}
        role="list"
      >
        {items.map((item) => (
          <li key={item.href}>
            <NavItemLink item={item} isActive={activeHref === item.href} isCollapsed={false} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── NavItemLink ───────────────────────────────────────────────────────────────
type NavItemLinkProps = {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
};

function NavItemLink({ item, isActive, isCollapsed }: NavItemLinkProps) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? item.label : undefined}
      className={cn(
        'group relative flex h-8 items-center gap-3 rounded-lg px-3 text-sm text-sidebar-foreground/80 transition-colors duration-150',
        'hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        isActive && 'bg-sidebar-accent text-sidebar-foreground font-semibold',
        isCollapsed && 'justify-center px-0',
      )}
    >
      <span
        className={cn(
          'absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200',
          isActive ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0',
        )}
      />
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center transition-transform group-hover:scale-110 motion-reduce:group-hover:scale-100">
        <Icon className="h-5 w-5" aria-hidden="true" />
        {item.badge !== undefined && item.badge > 0 && isCollapsed && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold leading-none text-destructive-foreground">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
      </span>
      {!isCollapsed && <span className="truncate">{item.label}</span>}
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
