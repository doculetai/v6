'use client';

import { LogOut, Moon, MoreVertical, Sun } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DashboardRole } from '@/config/roles';
import { dashboardShellCopy, getFallbackUserName, roleDisplayNames } from '@/config/copy/dashboard-shell';
import { useTheme } from '@/components/theme-provider';

type SidebarUserCardProps = {
  role: DashboardRole;
  isCollapsed: boolean;
  onSignOut: () => void;
};

export function SidebarUserCard({ role, isCollapsed, onSignOut }: SidebarUserCardProps) {
  const { isDark, toggleMode } = useTheme();

  const dropdownContent = (
    <DropdownMenuContent align={isCollapsed ? 'start' : 'end'} className="w-48">
      <DropdownMenuItem onClick={toggleMode}>
        {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
        {isDark ? 'Light mode' : 'Dark mode'}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive">
        <LogOut className="mr-2 h-4 w-4" />
        {dashboardShellCopy.sidebar.logoutLabel}
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (isCollapsed) {
    return (
      <div className="flex justify-center px-3 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="User menu"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <Avatar size="sm">
                <AvatarFallback className="bg-sidebar-foreground/15 text-xs font-semibold text-sidebar-foreground">
                  {dashboardShellCopy.sidebar.avatarFallback}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          {dropdownContent}
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-sidebar-accent">
      <Avatar size="sm">
        <AvatarFallback className="bg-sidebar-foreground/15 text-xs font-semibold text-sidebar-foreground">
          {dashboardShellCopy.sidebar.avatarFallback}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-sidebar-foreground">
          {getFallbackUserName(role)}
        </span>
        <span className="truncate text-xs text-sidebar-foreground/60">
          {roleDisplayNames[role]}
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="User menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        {dropdownContent}
      </DropdownMenu>
    </div>
  );
}
