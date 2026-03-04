import {
  Briefcase, Building2, GraduationCap, HeartHandshake, Shield, Users,
  type LucideIcon,
} from 'lucide-react';
import type { DashboardRole } from '@/config/roles';
import { roleDisplayNames } from '@/config/copy/dashboard-shell';

const roleIcons: Record<DashboardRole, LucideIcon> = {
  student: GraduationCap,
  sponsor: HeartHandshake,
  university: Building2,
  admin: Shield,
  agent: Users,
  partner: Briefcase,
};

type RoleIndicatorProps = {
  role: DashboardRole;
  isCollapsed: boolean;
};

export function RoleIndicator({ role, isCollapsed }: RoleIndicatorProps) {
  const Icon = roleIcons[role];
  const label = roleDisplayNames[role];

  if (isCollapsed) {
    return (
      <div className="flex justify-center px-2 py-0.5" title={label}>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-foreground/10 text-sidebar-foreground">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sidebar-foreground/10 text-sidebar-foreground">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="truncate text-xs font-medium text-sidebar-foreground/70">
        {label}
      </span>
    </div>
  );
}
