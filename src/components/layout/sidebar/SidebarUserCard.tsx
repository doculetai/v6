'use client';

import { SignOut } from '@/components/icons';
import { dashboardShellCopy, getFallbackUserName, roleDisplayNames } from '@/config/copy/dashboard-shell';
import type { DashboardRole } from '@/config/roles';
import { cn } from '@/lib/utils';

type SidebarUserCardProps = {
  role: DashboardRole;
  isCollapsed: boolean;
  user?: { fullName: string | null; email: string | null };
  onSignOut: () => void;
};

function deriveDisplayName(user: { fullName: string | null; email: string | null } | undefined, role: DashboardRole): string {
  if (user?.fullName) return user.fullName.split(' ')[0] ?? user.fullName;
  if (user?.email) {
    const prefix = user.email.split('@')[0] ?? '';
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return getFallbackUserName(role);
}

function deriveInitials(user: { fullName: string | null; email: string | null } | undefined): string {
  if (user?.fullName) {
    const parts = user.fullName.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    return (parts[0]?.slice(0, 2) ?? 'DU').toUpperCase();
  }
  if (user?.email) {
    const prefix = user.email.split('@')[0] ?? '';
    return (prefix.slice(0, 2)).toUpperCase();
  }
  return dashboardShellCopy.sidebar.avatarFallback;
}

export function SidebarUserCard({ role, isCollapsed, user, onSignOut }: SidebarUserCardProps) {
  const displayName = deriveDisplayName(user, role);
  const initials = deriveInitials(user);

  return (
    <>
      {/* User card */}
      <div className={cn(
        'flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 cursor-default',
        isCollapsed && 'justify-center px-0',
      )}>
        <div
          className="flex size-[30px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold tracking-tight text-white"
          style={{ backgroundColor: 'var(--role-accent)' }}
        >
          {initials}
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold leading-[1.3] text-sidebar-foreground">
              {displayName}
            </p>
            <span
              className="mt-0.5 inline-flex items-center rounded-full px-1.5 py-0 text-[9.5px] font-semibold uppercase tracking-wider"
              style={{ backgroundColor: 'var(--role-accent-bg)', color: 'var(--role-accent)' }}
            >
              {roleDisplayNames[role]}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-1.5 mx-1 border-t border-sidebar-border" />

      {/* Sign out */}
      <button
        type="button"
        onClick={onSignOut}
        className={cn(
          'flex w-full min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl px-3 text-[13px] font-medium text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
          isCollapsed && 'justify-center px-0',
        )}
      >
        <SignOut className="size-5 shrink-0" weight="duotone" aria-hidden="true" />
        {!isCollapsed && <span>{dashboardShellCopy.sidebar.logoutLabel}</span>}
      </button>
    </>
  );
}
