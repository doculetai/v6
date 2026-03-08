'use client';

import Image from 'next/image';
import { useState } from 'react';

import { MagnifyingGlass, Bell, Moon, Sun, CaretLeft, CaretRight } from '@/components/icons';
import { getNavConfig } from '@/config/nav';
import type { NavItem } from '@/config/nav/types';
import { dashboardShellCopy, roleDisplayNames } from '@/config/copy/dashboard-shell';
import { dashboardRoles, type DashboardRole } from '@/config/roles';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

// ── Role accents ─────────────────────────────────────────────────────────────
const ROLE_ACCENTS: Record<DashboardRole, { text: string; bg: string }> = {
  student:    { text: '#2B39A3', bg: 'rgba(43,57,163,0.13)'   },
  sponsor:    { text: '#15803D', bg: 'rgba(21,128,61,0.13)'   },
  university: { text: '#0369A1', bg: 'rgba(3,105,161,0.13)'   },
  admin:      { text: '#C2410C', bg: 'rgba(194,65,12,0.13)'   },
  agent:      { text: '#6D28D9', bg: 'rgba(109,40,217,0.13)'  },
  partner:    { text: '#0F766E', bg: 'rgba(15,118,110,0.13)'  },
};

const MOCK_USERS: Record<DashboardRole, { name: string; initials: string }> = {
  student:    { name: 'Kemi Adesanya',   initials: 'KA' },
  sponsor:    { name: 'Tunde Okafor',    initials: 'TO' },
  university: { name: 'UniLag Admin',    initials: 'UA' },
  admin:      { name: 'Platform Admin',  initials: 'PA' },
  agent:      { name: 'Samuel Adeyemi', initials: 'SA' },
  partner:    { name: 'Partner Account', initials: 'PR' },
};

// ── Nav item — flush-left border when active ──────────────────────────────────
function MockNavItem({
  item,
  isActive,
  accent,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  accent: { text: string; bg: string };
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full min-h-[44px] cursor-default items-center gap-2.5 transition-colors duration-150',
        isActive
          ? 'rounded-xl mx-2 font-semibold'
          : 'rounded-xl mx-2 text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground',
        collapsed ? 'justify-center px-[11px]' : 'px-3',
      )}
      style={
        isActive
          ? {
              backgroundColor: accent.text,
              color: '#FFFFFF',
            }
          : undefined
      }
    >
      {Icon && (
        <Icon
          className="size-5 shrink-0"
          weight="duotone"
          aria-hidden="true"
        />
      )}
      {!collapsed && (
        <span className="text-sm leading-5 truncate">{item.label}</span>
      )}
    </button>
  );
}

// ── Sidebar shell ─────────────────────────────────────────────────────────────
function MockSidebar({
  role,
  activeHref,
  onNavClick,
  collapsed,
  onToggleCollapsed,
}: {
  role: DashboardRole;
  activeHref: string;
  onNavClick: (href: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const navConfig = getNavConfig(role);
  const accent = ROLE_ACCENTS[role];
  const user = MOCK_USERS[role];

  const ungroupedItems = navConfig.items.filter((i) => !i.group);
  const groupedItems = navConfig.groups
    .map((group) => ({ group, items: navConfig.items.filter((i) => i.group === group.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <aside
      style={{ '--role-accent': accent.text } as React.CSSProperties}
      className={cn(
        'flex flex-col h-full overflow-hidden bg-sidebar transition-colors duration-150',
        'border-r border-sidebar-border shadow-[2px_0_12px_rgba(0,0,0,0.05)]',
        collapsed ? 'w-[64px]' : 'w-[240px]',
      )}
    >
      {/* ── Logo ── */}
      <div className={cn(
        'flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-[18px]',
        collapsed && 'justify-center px-0',
      )}>
        <Image
          src="/brand/assets/logo/doculet-shield-64.png"
          alt="Doculet"
          width={64}
          height={64}
          className={cn('shrink-0', collapsed ? 'size-8' : 'size-10')}
        />
        {!collapsed && (
          <>
            <span className="text-[15px] font-bold tracking-[-0.025em] text-sidebar-foreground">
              {dashboardShellCopy.brandName}
            </span>
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={dashboardShellCopy.sidebar.collapseLabel}
              className="ml-auto flex size-7 shrink-0 cursor-default items-center justify-center rounded-md bg-sidebar-foreground/[0.04] text-sidebar-foreground/35 transition-colors hover:bg-sidebar-foreground/[0.07] hover:text-sidebar-foreground/65"
            >
              <CaretLeft className="size-3" weight="bold" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* ── Quick action ── */}
      {navConfig.quickAction && !collapsed && (
        <>
          <div className="px-3 pt-3 pb-2">
            <button
              type="button"
              className="flex w-full min-h-[36px] cursor-default items-center gap-2 rounded-lg px-3 text-xs font-medium transition-colors hover:opacity-90"
              style={{
                backgroundColor: accent.bg,
                color: accent.text,
                border: `1px solid ${accent.text}22`,
              }}
            >
              {navConfig.quickAction.icon && (
                <navConfig.quickAction.icon className="size-4 shrink-0" weight="duotone" />
              )}
              <span className="truncate">{navConfig.quickAction.label}</span>
            </button>
          </div>
          <div className="mx-3 mb-1 border-t border-sidebar-border" />
        </>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label={dashboardShellCopy.sidebar.navAriaLabel}>
        {ungroupedItems.length > 0 && (
          <ul className="flex flex-col gap-1" role="list">
            {ungroupedItems.map((item) => (
              <li key={item.href}>
                <MockNavItem
                  item={item}
                  isActive={activeHref === item.href}
                  accent={accent}
                  collapsed={collapsed}
                  onClick={() => onNavClick(item.href)}
                />
              </li>
            ))}
          </ul>
        )}
        {groupedItems.map(({ group, items }) => (
          <div key={group.id} className="mt-4">
            {!collapsed && (
              <p className="px-[18px] pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/35">
                {group.label}
              </p>
            )}
            {collapsed && <div className="mx-4 mb-1.5 border-t border-sidebar-border" />}
            <ul className="flex flex-col gap-1" role="list">
              {items.map((item) => (
                <li key={item.href}>
                  <MockNavItem
                    item={item}
                    isActive={activeHref === item.href}
                    accent={accent}
                    collapsed={collapsed}
                    onClick={() => onNavClick(item.href)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer / user card ── */}
      <div className="shrink-0 border-t border-sidebar-border">
        <div className={cn(
          'flex items-center gap-2.5 px-3 py-3 cursor-default hover:bg-sidebar-accent transition-colors',
          collapsed && 'justify-center',
        )}>
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: accent.text }}
          >
            {user.initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold leading-[1.3] text-sidebar-foreground truncate">{user.name}</p>
              <span
                className="inline-flex items-center rounded-full px-1.5 py-0 text-[9.5px] font-semibold uppercase tracking-wider mt-0.5"
                style={{ backgroundColor: accent.bg, color: accent.text }}
              >
                {roleDisplayNames[role]}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────
export function SidebarDesignClient() {
  const [activeRole, setActiveRole] = useState<DashboardRole>('student');
  const [activeHref, setActiveHref] = useState('/dashboard/student/overview');
  const [collapsed, setCollapsed] = useState(false);
  const { isDark, toggleMode } = useTheme();

  const accent = ROLE_ACCENTS[activeRole];
  const user = MOCK_USERS[activeRole];

  const handleRoleSwitch = (role: DashboardRole) => {
    setActiveRole(role);
    const navConfig = getNavConfig(role);
    setActiveHref(navConfig.items[0]?.href ?? `/dashboard/${role}`);
  };

  return (
    <div className="flex h-screen flex-col bg-muted font-sans">

      {/* ── Controls bar ─────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Role</span>
        <div className="flex gap-1.5 flex-wrap">
          {dashboardRoles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleSwitch(role)}
              aria-pressed={activeRole === role}
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-semibold transition-colors',
                activeRole === role
                  ? 'text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
              style={activeRole === role ? { backgroundColor: ROLE_ACCENTS[role].text } : undefined}
            >
              {roleDisplayNames[role]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMode}
            aria-label={isDark ? dashboardShellCopy.sidebar.themeToggle.light : dashboardShellCopy.sidebar.themeToggle.dark}
            className="flex size-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
          >
            {isDark
              ? <Sun className="size-3.5" weight="duotone" aria-hidden="true" />
              : <Moon className="size-3.5" weight="duotone" aria-hidden="true" />}
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sidebar</span>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            {collapsed ? dashboardShellCopy.sidebar.expandLabel : dashboardShellCopy.sidebar.collapseLabel}
          </button>
        </div>
      </div>

      {/* ── Shell ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <MockSidebar
          role={activeRole}
          activeHref={activeHref}
          onNavClick={setActiveHref}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
        />

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* TopBar */}
          <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <span>Dashboard</span>
                <span className="text-muted-foreground/30">/</span>
                <span className="font-medium text-muted-foreground">Overview</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-48 items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 text-xs text-muted-foreground">
                <MagnifyingGlass className="size-3.5 shrink-0 opacity-60" weight="duotone" aria-hidden="true" />
                Search...
              </div>
              <div className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground">
                <Bell className="size-4" weight="duotone" aria-hidden="true" />
              </div>
              <div
                className="flex size-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ backgroundColor: accent.text }}
              >
                {user.initials}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1" style={{ color: accent.text }}>
                {roleDisplayNames[activeRole]} dashboard
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-7">Overview</h1>

              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3.5 mb-7">
                {['Metric one', 'Metric two', 'Metric three', 'Metric four'].map((label, i) => (
                  <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{label}</p>
                    <p className="text-2xl font-bold text-foreground font-mono">{(i + 1) * 12}</p>
                    <p className="mt-1 text-xs text-muted-foreground">description text</p>
                  </div>
                ))}
              </div>

              {/* Content section */}
              <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recent activity</p>
                  <a href="#" className="text-[11px] font-medium" style={{ color: accent.text }}>View all</a>
                </div>
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0">
                    <div className="size-8 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Activity item {n}</p>
                      <p className="text-xs text-muted-foreground">Subtitle text · Status</p>
                    </div>
                    <span className="text-xs text-muted-foreground">7 Mar</span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ── Design notes ─────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border bg-card px-5 py-2.5 text-[10.5px] text-muted-foreground flex items-center gap-5 flex-wrap">
        <span><strong className="text-foreground/60">Role:</strong> {activeRole}</span>
        <span><strong className="text-foreground/60">Accent:</strong> <code style={{ color: accent.text }}>{accent.text}</code></span>
        <span><strong className="text-foreground/60">Route:</strong> <code className="text-muted-foreground">{activeHref}</code></span>
        <span><strong className="text-foreground/60">Width:</strong> {collapsed ? '64px' : '240px'}</span>
        <span><strong className="text-foreground/60">Mode:</strong> {isDark ? 'dark' : 'light'}</span>
        <a href="/design/sidebar" className="ml-auto text-muted-foreground/50 hover:text-muted-foreground text-[10px] underline">reload</a>
      </div>
    </div>
  );
}
