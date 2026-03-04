import type { DashboardRole } from '@/config/roles';
import { isDashboardRole } from '@/config/roles';

import { adminNav } from './admin';
import { agentNav } from './agent';
import { partnerNav } from './partner';
import { sponsorNav } from './sponsor';
import { studentNav } from './student';
import type { NavItem } from './types';
import { universityNav } from './university';

const navByRole: Record<DashboardRole, NavItem[]> = {
  student: studentNav,
  sponsor: sponsorNav,
  university: universityNav,
  admin: adminNav,
  agent: agentNav,
  partner: partnerNav,
};

export function getNavItems(role: string): NavItem[] {
  if (!isDashboardRole(role)) {
    return [];
  }

  return navByRole[role];
}

export type { NavItem } from './types';
