'use client';

import { createBrowserClient } from '@supabase/ssr';
import { CaretDown } from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { dashboardShellCopy } from '@/config/copy/dashboard-shell';
import { getNavConfig } from '@/config/nav';
import type { NavItem } from '@/config/nav/types';
import type { DashboardRole } from '@/config/roles';
import type { StudentTrustStage } from '@/lib/student-trust-stage';
import { getStudentQuickAction } from '@/lib/student-trust-stage';
import { usePinnedItems } from '@/lib/hooks/usePinnedItems';
import { useRecentPages } from '@/lib/hooks/useRecentPages';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { NotificationsBell } from './NotificationsBell';
import { RoleIndicator } from './sidebar/RoleIndicator';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { SidebarQuickAction } from './sidebar/SidebarQuickAction';
import { SidebarToggle } from './sidebar/SidebarToggle';
import { SidebarUserCard } from './sidebar/SidebarUserCard';

// ── Role accent colours — "Safe & in good hands", bank-grade tinting ──────────
const ROLE_ACCENTS: Record<DashboardRole, { text: string; bg: string }> = {
  student:    { text: '#2B39A3', bg: 'rgba(43,57,163,0.10)'   },
  sponsor:    { text: '#15803D', bg: 'rgba(21,128,61,0.10)'   },
  university: { text: '#0369A1', bg: 'rgba(3,105,161,0.10)'   },
  admin:      { text: '#C2410C', bg: 'rgba(194,65,12,0.10)'   },
  agent:      { text: '#6D28D9', bg: 'rgba(109,40,217,0.10)'  },
  partner:    { text: '#0F766E', bg: 'rgba(15,118,110,0.10)'  },
};

type SidebarProps = {
  role: DashboardRole;
  currentPath: string;
  defaultCollapsed?: boolean;
  forceVisible?: boolean;
  studentTrustStage?: StudentTrustStage;
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

const SIDEBAR_STORAGE_KEY = 'doculet-sidebar-collapsed';

function useSidebarCollapsed(defaultCollapsed: boolean) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === 'true') setIsCollapsed(true);
    else if (stored === 'false') setIsCollapsed(false);
    setHydrated(true);
  }, []);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { isCollapsed, toggle, hydrated };
}

export function Sidebar({ role, currentPath, defaultCollapsed = false, forceVisible = false, studentTrustStage }: SidebarProps) {
  const router = useRouter();
  const navConfig = getNavConfig(role, { studentTrustStage });

  const quickAction =
    role === 'student' && studentTrustStage !== undefined
      ? getStudentQuickAction(studentTrustStage)
      : navConfig.quickAction;
  const { isCollapsed, toggle: toggleCollapsed, hydrated } = useSidebarCollapsed(defaultCollapsed);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const accent = ROLE_ACCENTS[role];

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

  const { pinnedHrefs } = usePinnedItems(role);
  const pinnedItems = pinnedHrefs
    .map((href) => navConfig.items.find((i) => i.href === href))
    .filter((i): i is NavItem => i !== undefined);
  const recentPages = useRecentPages(role);

  const ungroupedItems = navConfig.items.filter((i) => !i.group);
  const groupedItems = navConfig.groups
    .map((group) => ({ group, items: navConfig.items.filter((i) => i.group === group.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        style={{
          '--role-accent': accent.text,
          '--role-accent-bg': accent.bg,
        } as React.CSSProperties}
        className={cn(
          'flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md print:hidden',
          !forceVisible && 'hidden md:flex',
          'transition-[width,opacity] duration-200 ease-out',
          !hydrated && 'opacity-0',
          isCollapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* ── Logo ── */}
        <div className={cn(
          'flex shrink-0 items-center gap-2.5 px-4 py-4',
          isCollapsed && 'justify-center px-3',
        )}>
          <Link
            href={`/dashboard/${role}`}
            className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--role-accent)]"
            aria-label={dashboardShellCopy.logoAlt}
          >
            <Image
              src="/brand/assets/logo/doculet-shield-64.png"
              alt=""
              width={64}
              height={64}
              className={cn('shrink-0', isCollapsed ? 'size-8' : 'size-9')}
              aria-hidden="true"
            />
            {!isCollapsed && (
              <span className="text-[15px] font-bold tracking-[-0.02em] text-sidebar-foreground">
                {dashboardShellCopy.brandName}
              </span>
            )}
          </Link>
        </div>

        {/* ── Role indicator ── */}
        <RoleIndicator role={role} isCollapsed={isCollapsed} />

        {/* ── Quick action ── */}
        <div className="px-3 pb-2 pt-1">
          <SidebarQuickAction
            label={quickAction.label}
            icon={quickAction.icon}
            href={quickAction.href}
            isCollapsed={isCollapsed}
          />
        </div>

        {/* ── Separator ── */}
        <div className="mx-3 border-t border-sidebar-border" />

        {/* ── Pinned items ── */}
        {pinnedItems.length > 0 && (
          <div className="px-2 pt-2">
            {!isCollapsed && (
              <p className="px-2 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-sidebar-foreground/50">
                Pinned
              </p>
            )}
            <ul className="flex flex-col gap-px" role="list">
              {pinnedItems.map((item) => (
                <li key={item.href}>
                  <NavItemLink item={item} isActive={activeHref === item.href} isCollapsed={isCollapsed} />
                </li>
              ))}
            </ul>
            <div className="mx-1 mt-2 border-t border-sidebar-border" />
          </div>
        )}

        {/* ── Nav ── */}
        <nav
          aria-label={dashboardShellCopy.sidebar.navAriaLabel}
          className="flex-1 overflow-y-auto py-2"
        >
          {ungroupedItems.length > 0 && (
            <ul className="flex flex-col gap-px px-2" role="list">
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

        {/* ── Recent pages ── */}
        {!isCollapsed && recentPages.length > 0 && (
          <div className="border-t border-sidebar-border px-2 py-2">
            <p className="px-2 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-sidebar-foreground/50">
              Recent
            </p>
            <ul className="flex flex-col gap-px" role="list">
              {recentPages.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className={cn(
                      'flex min-h-[36px] items-center rounded-md px-3 text-[12.5px] font-[450] text-sidebar-foreground/60',
                      'transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground',
                    )}
                  >
                    <span className="truncate">{page.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Bottom ── */}
        <div
          className="flex shrink-0 flex-col border-t border-sidebar-border"
          data-testid="sidebar-bottom"
        >
          <div className={cn(
            'flex items-center gap-1 px-2 pt-1',
            isCollapsed && 'justify-center',
          )}>
            <NotificationsBell
              role={role}
              className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            />
            <SidebarToggle isCollapsed={isCollapsed} onToggle={toggleCollapsed} />
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

const NAV_GROUP_STORAGE_PREFIX = 'doculet-nav-group-';

function NavGroup({ label, items, activeHref, isCollapsed }: NavGroupProps) {
  const storageKey = `${NAV_GROUP_STORAGE_PREFIX}${label.toLowerCase().replace(/\s+/g, '-')}`;
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(storageKey) !== 'false';
  });
  const listId = `nav-group-${label.toLowerCase().replace(/\s+/g, '-')}`;

  if (isCollapsed) {
    return (
      <div className="mt-1">
        <div role="separator" className="mx-2 border-t border-sidebar-border" />
        <ul className="mt-1 flex flex-col gap-px px-2" role="list">
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
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setIsOpen((p) => {
          const next = !p;
          localStorage.setItem(storageKey, String(next));
          return next;
        })}
        className="flex w-full items-center justify-between px-4 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-sidebar-foreground/50 hover:text-sidebar-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--role-accent)] focus-visible:rounded-sm transition-colors"
        aria-expanded={isOpen}
        aria-controls={listId}
      >
        {label}
        <CaretDown weight="duotone"
          className={cn('h-3 w-3 transition-transform duration-150', !isOpen && '-rotate-90')}
        />
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <ul
          id={listId}
          className="flex flex-col gap-px overflow-hidden px-2"
          role="list"
        >
          {items.map((item) => (
            <li key={item.href}>
              <NavItemLink item={item} isActive={activeHref === item.href} isCollapsed={false} />
            </li>
          ))}
        </ul>
      </div>
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

  if (item.disabled) {
    const disabledEl = (
      <span
        aria-disabled="true"
        title={isCollapsed ? (item.disabledReason ?? item.label) : item.disabledReason}
        className={cn(
          'group relative flex min-h-[44px] cursor-not-allowed items-center gap-3 rounded-md px-3 text-[13.5px] opacity-40',
          isCollapsed && 'justify-center px-0',
        )}
      >
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center text-sidebar-foreground/55">
          <Icon className="size-[18px]" weight="duotone" aria-hidden="true" />
        </span>
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </span>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{disabledEl}</TooltipTrigger>
          <TooltipContent side="right">
            <span className="font-medium">{item.label}</span>
            {item.disabledReason && (
              <span className="block text-xs text-muted-foreground">{item.disabledReason}</span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return disabledEl;
  }

  const link = (
    <Link
      href={item.href}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? item.label : undefined}
      style={isActive ? {
        backgroundColor: 'var(--role-accent-bg)',
        color: 'var(--role-accent)',
      } : undefined}
      className={cn(
        'group relative flex min-h-[44px] items-center gap-3 rounded-md px-3 text-[13.5px] transition-colors duration-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--role-accent)]',
        isActive
          ? 'font-semibold'
          : 'font-[450] text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
        isCollapsed && 'justify-center px-0',
      )}
    >
      {/* Left accent indicator */}
      <span
        style={isActive ? { backgroundColor: 'var(--role-accent)' } : undefined}
        className={cn(
          'absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full transition-[transform,opacity] duration-150',
          isActive ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0',
        )}
      />

      <span className={cn(
        'relative flex h-8 w-8 shrink-0 items-center justify-center',
        !isActive && 'text-sidebar-foreground/55',
      )}>
        <Icon className="size-[18px]" weight="duotone" aria-hidden="true" />
        {item.badge !== undefined && item.badge > 0 && isCollapsed && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold leading-none text-destructive-foreground">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
      </span>

      {!isCollapsed && <span className="truncate">{item.label}</span>}

      {item.badge !== undefined && item.badge > 0 && !isCollapsed && (
        <span className={cn(
          'ml-auto flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground',
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
