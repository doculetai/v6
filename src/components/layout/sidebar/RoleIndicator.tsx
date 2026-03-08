import {
  Briefcase, Buildings, GraduationCap, Handshake, Shield, Users,
  type Icon,
} from '@/components/icons';
import { adminCopy } from '@/config/copy/admin';
import type { DashboardRole } from '@/config/roles';
import { roleDisplayNames } from '@/config/copy/dashboard-shell';

const roleIcons: Record<DashboardRole, Icon> = {
  student: GraduationCap,
  sponsor: Handshake,
  university: Buildings,
  admin: Shield,
  agent: Users,
  partner: Briefcase,
};

type AdminSubRole = 'reviewer' | 'support';

type RoleIndicatorProps = {
  role: DashboardRole;
  isCollapsed: boolean;
  subRole?: AdminSubRole | null;
};

export function RoleIndicator({ role, isCollapsed, subRole }: RoleIndicatorProps) {
  const IconComponent = roleIcons[role];
  const label = roleDisplayNames[role];
  const subRoleLabel = subRole ? adminCopy.subRoles[subRole] : null;

  if (isCollapsed) {
    return (
      <div className="flex justify-center px-2 py-0.5" title={subRoleLabel ? `${label} — ${subRoleLabel}` : label}>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-foreground/10 text-sidebar-foreground">
          <IconComponent className="h-4 w-4" weight="duotone" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sidebar-foreground/10 text-sidebar-foreground">
        <IconComponent className="h-3.5 w-3.5" weight="duotone" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-xs font-medium text-sidebar-foreground/70">
          {label}
        </span>
        {subRoleLabel && (
          <span className="truncate text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
            {subRoleLabel}
          </span>
        )}
      </div>
    </div>
  );
}
