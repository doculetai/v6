'use client';

import { SignOut } from '@phosphor-icons/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { DashboardRole } from '@/config/roles';
import { dashboardShellCopy, getFallbackUserName, roleDisplayNames } from '@/config/copy/dashboard-shell';

type SidebarUserCardProps = {
  role: DashboardRole;
  isCollapsed: boolean;
  onSignOut: () => void;
};

export function SidebarUserCard({ role, isCollapsed, onSignOut }: SidebarUserCardProps) {
  if (isCollapsed) {
    return (
      <div className="flex justify-center px-3 py-2">
        <button
          type="button"
          aria-label={dashboardShellCopy.sidebar.logoutLabel}
          onClick={onSignOut}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Avatar size="sm">
            <AvatarFallback
              className="text-xs font-semibold"
              style={{ backgroundColor: 'var(--role-accent-bg)', color: 'var(--role-accent)' }}
            >
              {dashboardShellCopy.sidebar.avatarFallback}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback
              className="text-xs font-semibold"
              style={{ backgroundColor: 'var(--role-accent-bg)', color: 'var(--role-accent)' }}
            >
              {dashboardShellCopy.sidebar.avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              {getFallbackUserName(role)}
            </span>
            <span
              className="inline-flex w-fit items-center rounded-full px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: 'var(--role-accent-bg)', color: 'var(--role-accent)' }}
            >
              {roleDisplayNames[role]}
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <SignOut className="h-4 w-4" weight="duotone" aria-hidden="true" />
        {dashboardShellCopy.sidebar.logoutLabel}
      </button>
    </>
  );
}
