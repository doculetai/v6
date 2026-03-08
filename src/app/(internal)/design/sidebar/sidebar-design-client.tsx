'use client';

import Image from 'next/image';
import { useState } from 'react';

import { getNavConfig } from '@/config/nav';
import type { NavItem } from '@/config/nav/types';
import { dashboardShellCopy } from '@/config/copy/dashboard-shell';
import { dashboardRoles, type DashboardRole } from '@/config/roles';
import { cn } from '@/lib/utils';

// ── Role accents ─────────────────────────────────────────────────────────────
const ROLE_ACCENTS: Record<DashboardRole, { text: string; bg: string; label: string }> = {
  student:    { text: '#2B39A3', bg: 'rgba(43,57,163,0.10)',   label: 'Student'    },
  sponsor:    { text: '#15803D', bg: 'rgba(21,128,61,0.10)',   label: 'Sponsor'    },
  university: { text: '#0369A1', bg: 'rgba(3,105,161,0.10)',   label: 'University' },
  admin:      { text: '#C2410C', bg: 'rgba(194,65,12,0.10)',   label: 'Admin'      },
  agent:      { text: '#6D28D9', bg: 'rgba(109,40,217,0.10)',  label: 'Agent'      },
  partner:    { text: '#0F766E', bg: 'rgba(15,118,110,0.10)',  label: 'Partner'    },
};

const MOCK_USERS: Record<DashboardRole, { name: string; email: string; initials: string }> = {
  student:    { name: 'Kemi Adesanya',    email: 'kemi.a@doculet.test',    initials: 'KA' },
  sponsor:    { name: 'Tunde Okafor',     email: 'tunde.o@doculet.test',   initials: 'TO' },
  university: { name: 'UniLag Admin',     email: 'admin@unilag.edu.ng',    initials: 'UA' },
  admin:      { name: 'Platform Admin',   email: 'platform@doculet.ai',    initials: 'PA' },
  agent:      { name: 'Samuel Adeyemi',   email: 'sam.a@agency.com',       initials: 'SA' },
  partner:    { name: 'Partner Account',  email: 'partner@example.com',    initials: 'PR' },
};

const MOCK_PAGES = [
  'Overview',
  'Students',
  'Documents',
  'Settings',
];

type SidebarVariant = 'current' | 'condensed' | 'icon-only';

function MockNavItem({
  item,
  isActive,
  accent,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  accent: { text: string; bg: string };
  collapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <div
      className={cn(
        'group flex min-h-[40px] cursor-default items-center rounded-md gap-2.5 transition-all duration-100',
        collapsed ? 'justify-center px-2' : 'px-3',
        isActive
          ? 'font-semibold'
          : 'text-[#0F172A]/60 hover:bg-black/[0.04] hover:text-[#0F172A]',
      )}
      style={
        isActive
          ? {
              backgroundColor: accent.bg,
              color: accent.text,
              borderLeft: `2.5px solid ${accent.text}`,
              paddingLeft: collapsed ? undefined : '10px',
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
        <span className="text-[13px] leading-5 truncate">{item.label}</span>
      )}
    </div>
  );
}

function MockSidebar({
  role,
  activeHref,
  onNavClick,
  collapsed,
}: {
  role: DashboardRole;
  activeHref: string;
  onNavClick: (href: string) => void;
  collapsed: boolean;
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
        'flex flex-col h-full border-r border-black/[0.07] bg-[#FDFCFA] transition-[width] duration-150 ease-out shadow-[1px_0_0_rgba(0,0,0,0.04)]',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex shrink-0 items-center gap-2.5 border-b border-black/[0.07] px-4 py-4',
        collapsed && 'justify-center px-3',
      )}>
        <Image
          src="/brand/assets/logo/doculet-shield-64.png"
          alt="Doculet"
          width={64}
          height={64}
          className={cn('shrink-0', collapsed ? 'size-8' : 'size-9')}
        />
        {!collapsed && (
          <span className="text-[15px] font-bold tracking-[-0.02em] text-[#0F172A]">
            {dashboardShellCopy.brandName}
          </span>
        )}
      </div>

      {/* Quick action */}
      {navConfig.quickAction && !collapsed && (
        <div className="px-3 pt-3 pb-2">
          <div className="flex min-h-[38px] cursor-default items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-[12.5px] font-medium text-foreground shadow-sm transition-colors hover:bg-muted/60">
            {navConfig.quickAction.icon && (
              <navConfig.quickAction.icon className="size-4 shrink-0" weight="duotone" />
            )}
            <span className="truncate">{navConfig.quickAction.label}</span>
          </div>
        </div>
      )}
      {navConfig.quickAction && !collapsed && (
        <div className="mx-3 border-t border-black/[0.07]" />
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Navigation">
        {ungroupedItems.length > 0 && (
          <ul className="flex flex-col gap-px px-2">
            {ungroupedItems.map((item) => (
              <li key={item.href} onClick={() => onNavClick(item.href)}>
                <MockNavItem item={item} isActive={activeHref === item.href} accent={accent} collapsed={collapsed} />
              </li>
            ))}
          </ul>
        )}
        {groupedItems.map(({ group, items }) => (
          <div key={group.id} className="mt-3 px-2">
            {!collapsed && (
              <p className="px-3 pb-1 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[#0F172A]/40">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-px">
              {items.map((item) => (
                <li key={item.href} onClick={() => onNavClick(item.href)}>
                  <MockNavItem item={item} isActive={activeHref === item.href} accent={accent} collapsed={collapsed} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-black/[0.07] px-3 py-3">
        <div className={cn(
          'flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-black/[0.04] cursor-default transition-colors',
          collapsed && 'justify-center',
        )}>
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: accent.text }}
          >
            {user.initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold leading-4 text-[#0F172A] truncate">{user.name}</p>
              <p className="mt-0.5 text-[10.5px] uppercase font-semibold tracking-wide" style={{ color: accent.text }}>
                {ROLE_ACCENTS[role].label}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export function SidebarDesignClient() {
  const [activeRole, setActiveRole] = useState<DashboardRole>('student');
  const [activeHref, setActiveHref] = useState('/dashboard/student');
  const [collapsed, setCollapsed] = useState(false);

  const accent = ROLE_ACCENTS[activeRole];
  const user = MOCK_USERS[activeRole];

  const handleRoleSwitch = (role: DashboardRole) => {
    setActiveRole(role);
    setActiveHref(`/dashboard/${role}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F4F5] font-sans">

      {/* ── Controls bar ─────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-black/10 bg-white px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-black/40">Role</span>
        <div className="flex gap-1.5 flex-wrap">
          {dashboardRoles.map((role) => (
            <button
              key={role}
              onClick={() => handleRoleSwitch(role)}
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-semibold transition-all',
                activeRole === role
                  ? 'text-white shadow-sm'
                  : 'bg-black/[0.06] text-black/50 hover:bg-black/[0.10]',
              )}
              style={
                activeRole === role
                  ? { backgroundColor: ROLE_ACCENTS[role].text }
                  : undefined
              }
            >
              {ROLE_ACCENTS[role].label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-black/40">Sidebar</span>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-medium text-black/60 hover:bg-black/[0.04] transition-colors"
          >
            {collapsed ? 'Expand' : 'Collapse'}
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
        />

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* TopBar */}
          <header className="flex h-14 shrink-0 items-center gap-4 border-b border-black/[0.07] bg-white px-5">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[12.5px] text-black/40">
                <span>Dashboard</span>
                <span>/</span>
                <span className="font-medium text-black/70">Overview</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-52 items-center gap-2 rounded-md border border-black/[0.09] bg-black/[0.03] px-3 text-[12px] text-black/40">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-50"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Search...
              </div>
              <div className="flex size-8 items-center justify-center rounded-full border border-black/[0.09] text-black/50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2"/></svg>
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
            <div className="mx-auto max-w-4xl">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: accent.text }}>
                {ROLE_ACCENTS[activeRole].label} dashboard
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A] mb-8">Overview</h1>

              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {['Metric one', 'Metric two', 'Metric three', 'Metric four'].map((label, i) => (
                  <div key={label} className="rounded-xl border border-black/[0.07] bg-white p-5 shadow-sm">
                    <p className="text-[10.5px] font-semibold uppercase tracking-widest text-black/40 mb-2">{label}</p>
                    <p className="text-2xl font-bold text-[#0F172A] font-mono">{(i + 1) * 12}</p>
                    <p className="mt-1 text-[11.5px] text-black/50">description text</p>
                  </div>
                ))}
              </div>

              {/* Content section */}
              <div className="rounded-xl border border-black/[0.07] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-black/[0.07] px-5 py-3.5">
                  <p className="text-[10.5px] font-semibold uppercase tracking-widest text-black/40">Recent activity</p>
                  <a className="text-[11px] font-medium" style={{ color: accent.text }}>View all</a>
                </div>
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex items-center gap-4 border-b border-black/[0.05] px-5 py-3.5 last:border-b-0">
                    <div className="size-8 rounded-full bg-black/[0.05] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A]">Activity item {n}</p>
                      <p className="text-xs text-black/40">Subtitle text · Status</p>
                    </div>
                    <span className="text-xs text-black/40">7 Mar</span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ── Design notes panel ───────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-black/10 bg-white px-5 py-3 text-[11px] text-black/40 flex items-center gap-6 flex-wrap">
        <span><strong className="text-black/60">Active role:</strong> {activeRole}</span>
        <span><strong className="text-black/60">Accent:</strong> <code style={{ color: accent.text }}>{accent.text}</code></span>
        <span><strong className="text-black/60">Active route:</strong> <code>{activeHref}</code></span>
        <a href="/design/sidebar" className="ml-auto text-black/40 underline text-[10px]">reload</a>
        <span><strong className="text-black/60">Sidebar:</strong> {collapsed ? 'collapsed (64px)' : 'expanded (240px)'}</span>
      </div>
    </div>
  );
}
