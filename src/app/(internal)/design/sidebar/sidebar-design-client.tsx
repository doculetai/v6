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
  student:    { text: '#2B39A3', bg: 'rgba(43,57,163,0.13)',   label: 'Student'    },
  sponsor:    { text: '#15803D', bg: 'rgba(21,128,61,0.13)',   label: 'Sponsor'    },
  university: { text: '#0369A1', bg: 'rgba(3,105,161,0.13)',   label: 'University' },
  admin:      { text: '#C2410C', bg: 'rgba(194,65,12,0.13)',   label: 'Admin'      },
  agent:      { text: '#6D28D9', bg: 'rgba(109,40,217,0.13)',  label: 'Agent'      },
  partner:    { text: '#0F766E', bg: 'rgba(15,118,110,0.13)',  label: 'Partner'    },
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
        'group flex min-h-[40px] cursor-default items-center gap-2.5 transition-all duration-100',
        // Active: flush to left edge, rounded only on right
        // Inactive: full rounded with horizontal margin
        isActive
          ? 'rounded-r-[7px] mr-2 font-medium'
          : 'rounded-[7px] mx-2 text-[#0F172A]/55 hover:bg-black/[0.04] hover:text-[#0F172A]',
        collapsed ? 'justify-center px-[11px]' : 'px-3',
      )}
      style={
        isActive
          ? {
              backgroundColor: accent.bg,
              color: accent.text,
              borderLeft: `3px solid ${accent.text}`,
              paddingLeft: collapsed ? undefined : '11px',
            }
          : undefined
      }
    >
      {Icon && (
        <Icon
          className="size-[18px] shrink-0"
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

// ── Sidebar shell ─────────────────────────────────────────────────────────────
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
        'flex flex-col h-full bg-[#FDFCFA] transition-[width] duration-150 ease-out',
        'border-r border-black/[0.08] shadow-[2px_0_12px_rgba(0,0,0,0.05)]',
        collapsed ? 'w-[64px]' : 'w-[240px]',
      )}
    >
      {/* ── Logo ── */}
      <div className={cn(
        'flex shrink-0 items-center gap-2.5 border-b border-black/[0.07] px-[18px] py-[14px]',
        collapsed && 'justify-center px-0',
      )}>
        <Image
          src="/brand/assets/logo/doculet-shield-64.png"
          alt="Doculet"
          width={64}
          height={64}
          className={cn('shrink-0', collapsed ? 'size-8' : 'size-[34px]')}
        />
        {!collapsed && (
          <span className="text-[14.5px] font-bold tracking-[-0.025em] text-[#0F172A]">
            {dashboardShellCopy.brandName}
          </span>
        )}
      </div>

      {/* ── Quick action ── */}
      {navConfig.quickAction && !collapsed && (
        <>
          <div className="px-3 pt-3 pb-2">
            <div
              className="flex min-h-[36px] cursor-default items-center gap-2 rounded-lg px-3 text-[12.5px] font-medium transition-colors hover:opacity-90"
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
            </div>
          </div>
          <div className="mx-3 mb-1 border-t border-black/[0.06]" />
        </>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Navigation">
        {ungroupedItems.length > 0 && (
          // No horizontal padding here — flush border needs items to start at edge
          <ul className="flex flex-col gap-px">
            {ungroupedItems.map((item) => (
              <li key={item.href} onClick={() => onNavClick(item.href)}>
                <MockNavItem
                  item={item}
                  isActive={activeHref === item.href}
                  accent={accent}
                  collapsed={collapsed}
                />
              </li>
            ))}
          </ul>
        )}
        {groupedItems.map(({ group, items }) => (
          <div key={group.id} className="mt-4">
            {!collapsed && (
              <p className="px-[18px] pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0F172A]/35">
                {group.label}
              </p>
            )}
            {collapsed && <div className="mx-4 mb-1.5 border-t border-black/[0.07]" />}
            <ul className="flex flex-col gap-px">
              {items.map((item) => (
                <li key={item.href} onClick={() => onNavClick(item.href)}>
                  <MockNavItem
                    item={item}
                    isActive={activeHref === item.href}
                    accent={accent}
                    collapsed={collapsed}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer / user card ── */}
      <div className="shrink-0 border-t border-black/[0.07]">
        <div className={cn(
          'flex items-center gap-2.5 px-3 py-3 cursor-default hover:bg-black/[0.03] transition-colors',
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
              <p className="text-[12.5px] font-semibold leading-[1.3] text-[#0F172A] truncate">{user.name}</p>
              <span
                className="inline-flex items-center rounded-full px-1.5 py-0 text-[9.5px] font-semibold uppercase tracking-wider mt-0.5"
                style={{ backgroundColor: accent.bg, color: accent.text }}
              >
                {ROLE_ACCENTS[role].label}
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
  const [activeHref, setActiveHref] = useState('/dashboard/student');
  const [collapsed, setCollapsed] = useState(false);

  const accent = ROLE_ACCENTS[activeRole];
  const user = MOCK_USERS[activeRole];

  const handleRoleSwitch = (role: DashboardRole) => {
    setActiveRole(role);
    setActiveHref(`/dashboard/${role}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F0EFEE] font-sans">

      {/* ── Controls bar ─────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-black/10 bg-white px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35">Role</span>
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
              style={activeRole === role ? { backgroundColor: ROLE_ACCENTS[role].text } : undefined}
            >
              {ROLE_ACCENTS[role].label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35">Sidebar</span>
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
          <header className="flex h-14 shrink-0 items-center gap-4 border-b border-black/[0.07] bg-white px-5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[12.5px] text-black/35">
                <span>Dashboard</span>
                <span className="text-black/20">/</span>
                <span className="font-medium text-black/65">Overview</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-48 items-center gap-2 rounded-lg border border-black/[0.09] bg-black/[0.03] px-3 text-[12px] text-black/35">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-50"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Search...
              </div>
              <div className="flex size-8 items-center justify-center rounded-full border border-black/[0.09] text-black/40">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.75"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.75"/></svg>
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
                {ROLE_ACCENTS[activeRole].label} dashboard
              </p>
              <h1 className="text-[28px] font-semibold tracking-tight text-[#0F172A] mb-7">Overview</h1>

              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3.5 mb-7">
                {['Metric one', 'Metric two', 'Metric three', 'Metric four'].map((label, i) => (
                  <div key={label} className="rounded-xl border border-black/[0.07] bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/35 mb-2">{label}</p>
                    <p className="text-2xl font-bold text-[#0F172A] font-mono">{(i + 1) * 12}</p>
                    <p className="mt-1 text-[11.5px] text-black/45">description text</p>
                  </div>
                ))}
              </div>

              {/* Content section */}
              <div className="rounded-xl border border-black/[0.07] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/35">Recent activity</p>
                  <a className="text-[11px] font-medium" style={{ color: accent.text }}>View all</a>
                </div>
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex items-center gap-4 border-b border-black/[0.05] px-5 py-3.5 last:border-b-0">
                    <div className="size-8 rounded-full bg-black/[0.05] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-[#0F172A]">Activity item {n}</p>
                      <p className="text-xs text-black/40">Subtitle text · Status</p>
                    </div>
                    <span className="text-[11.5px] text-black/35">7 Mar</span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ── Design notes ─────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-black/10 bg-white px-5 py-2.5 text-[10.5px] text-black/40 flex items-center gap-5 flex-wrap">
        <span><strong className="text-black/55">Role:</strong> {activeRole}</span>
        <span><strong className="text-black/55">Accent:</strong> <code style={{ color: accent.text }}>{accent.text}</code></span>
        <span><strong className="text-black/55">Route:</strong> <code className="text-black/50">{activeHref}</code></span>
        <span><strong className="text-black/55">Width:</strong> {collapsed ? '64px' : '240px'}</span>
        <a href="/design/sidebar" className="ml-auto text-black/30 hover:text-black/50 text-[10px] underline">reload</a>
      </div>
    </div>
  );
}
