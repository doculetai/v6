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
  density?: 'comfortable' | 'compact';
  defaultCollapsed?: boolean;
};

// Longest-prefix-wins active matching
function findBestMatch(items: NavItem[], currentPath: string): string | null {
  let best: NavItem | null = null;
  for (const item of items) {
    if (currentPath === item.href || currentPath.startsWith(`${item.href}/`)) {
      if (!best || item.href.length > best.href.length) {
        best = item;
      }
    }
    if (item.children) {
      for (const child of item.children) {
        if (currentPath === child.href || currentPath.startsWith(`${child.href}/`)) {
          if (!best || child.href.length > best.href.length) {
            best = child;
          }
        }
      }
    }
  }
  return best?.href ?? null;
}

export function Sidebar({
  role,
  currentPath,
  density = 'comfortable',
  defaultCollapsed = false,
}: SidebarProps) {
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

  const paddingY = density === 'compact' ? 'py-1.5' : 'py-2.5';

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
          'relative flex h-full flex-col transition-all duration-300',
          'bg-card/80 backdrop-blur-xl',
          'border-r border-border/60',
          'before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/[0.03] before:to-transparent',
          isCollapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* Header: Logo + Collapse Toggle */}
        <div
          className={cn(
            'flex items-center border-b border-border/60 px-3',
            isCollapsed ? 'h-16 justify-center' : 'h-16 justify-between',
          )}
        >
          {!isCollapsed && (
            <Link
              href={`/dashboard/${role}`}
              className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image
                src="/brand/logos/logo.svg"
                alt={dashboardShellCopy.logoAlt}
                width={120}
                height={28}
                priority
                className="h-7 w-auto dark:hidden"
              />
              <Image
                src="/brand/logos/logo-dark.svg"
                alt={dashboardShellCopy.logoAlt}
                width={120}
                height={28}
                priority
                className="hidden h-7 w-auto dark:block"
              />
            </Link>
          )}
          {isCollapsed && (
            <Link
              href={`/dashboard/${role}`}
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image
                src="/brand/logos/doculet-shield.svg"
                alt="Doculet"
                width={28}
                height={28}
                className="size-7"
              />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed((v) => !v)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isCollapsed && 'mx-auto',
            )}
          >
            <PanelLeftClose
              className={cn(
                'size-4 transition-transform duration-300',
                isCollapsed && 'rotate-180',
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label={dashboardShellCopy.sidebar.navAriaLabel}
          className="flex-1 overflow-y-auto px-2 py-3"
        >
          {ungroupedItems.length > 0 && (
            <ul className="mb-3 space-y-0.5">
              {ungroupedItems.map((item) => (
                <NavItemRow
                  key={item.href}
                  item={item}
                  isActive={activeHref === item.href}
                  isCollapsed={isCollapsed}
                  paddingY={paddingY}
                  activeHref={activeHref}
                />
              ))}
            </ul>
          )}

          {groupedItems.map(({ group, items }) => (
            <div
              key={group.id}
              className={cn(
                'mb-3',
                !isCollapsed &&
                  'rounded-xl border border-border/40 bg-background/40 p-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
              )}
            >
              {!isCollapsed && (
                <p className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {group.label}
                </p>
              )}
              {isCollapsed && <div className="mx-auto mb-1.5 h-px w-8 bg-border/60" />}
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <NavItemRow
                    key={item.href}
                    item={item}
                    isActive={activeHref === item.href}
                    isCollapsed={isCollapsed}
                    paddingY={paddingY}
                    activeHref={activeHref}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer: User + Logout */}
        <div className="border-t border-border/60 p-2">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isSigningOut}
                  className="flex w-full items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={dashboardShellCopy.sidebar.logoutLabel}
                >
                  <LogOut className="size-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {dashboardShellCopy.sidebar.logoutLabel}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="rounded-xl border border-border/40 bg-background/40 p-2">
              <div className="mb-2 flex items-center gap-2.5 px-1">
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {dashboardShellCopy.sidebar.avatarFallback}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {getFallbackUserName(role)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {roleDisplayNames[role]}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isSigningOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut className="size-4" />
                <span>{dashboardShellCopy.sidebar.logoutLabel}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── NavItemRow ──────────────────────────────────────────
type NavItemRowProps = {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  paddingY: string;
  activeHref: string | null;
};

function NavItemRow({ item, isActive, isCollapsed, paddingY, activeHref }: NavItemRowProps) {
  const Icon = item.icon;
  const [childrenOpen, setChildrenOpen] = useState(
    item.children?.some((c) => activeHref === c.href) ?? false,
  );

  const linkClasses = cn(
    'group relative flex w-full items-center gap-2.5 rounded-lg text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    paddingY,
    isCollapsed ? 'justify-center px-2' : 'px-3',
    isActive
      ? 'bg-primary/10 font-medium text-primary ring-1 ring-primary/20'
      : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground',
  );

  const iconEl = (
    <span className="relative flex shrink-0 items-center justify-center">
      <Icon
        className={cn(
          'size-5 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
        )}
        aria-hidden="true"
      />
      {item.badge && item.badge > 0 ? (
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      ) : null}
    </span>
  );

  if (isCollapsed) {
    return (
      <li>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={linkClasses}
              aria-current={isActive ? 'page' : undefined}
            >
              {iconEl}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex flex-col gap-0.5">
            <span className="font-medium">{item.label}</span>
            {item.description && (
              <span className="text-xs text-muted-foreground">{item.description}</span>
            )}
          </TooltipContent>
        </Tooltip>
      </li>
    );
  }

  if (item.children && item.children.length > 0) {
    return (
      <li>
        <button
          type="button"
          onClick={() => setChildrenOpen((v) => !v)}
          className={cn(linkClasses, 'justify-between')}
        >
          <span className="flex items-center gap-2.5">
            {iconEl}
            <span className="truncate">{item.label}</span>
          </span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 transition-transform duration-200',
              childrenOpen && 'rotate-180',
            )}
          />
        </button>
        {childrenOpen && (
          <ul className="ml-9 mt-0.5 space-y-0.5 border-l border-border/60 pl-3">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              const isChildActive = activeHref === child.href;
              return (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    aria-current={isChildActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isChildActive
                        ? 'font-medium text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <ChildIcon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{child.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link href={item.href} className={linkClasses} aria-current={isActive ? 'page' : undefined}>
        {iconEl}
        <span className="truncate">{item.label}</span>
        {item.badge && item.badge > 0 ? (
          <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {item.badge}
          </span>
        ) : null}
      </Link>
    </li>
  );
}
