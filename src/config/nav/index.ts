import { Home } from 'lucide-react';

import type { DashboardRole } from '@/config/roles';
import { isDashboardRole } from '@/config/roles';

import { adminNavConfig } from './admin';
import { agentNavConfig } from './agent';
import { partnerNavConfig } from './partner';
import { sponsorNavConfig } from './sponsor';
import { studentNavConfig } from './student';
import type { NavConfig, NavItem } from './types';
import { universityNavConfig } from './university';

const navConfigByRole: Record<DashboardRole, NavConfig> = {
  student: studentNavConfig,
  sponsor: sponsorNavConfig,
  university: universityNavConfig,
  admin: adminNavConfig,
  agent: agentNavConfig,
  partner: partnerNavConfig,
};

export function getNavConfig(role: string): NavConfig {
  if (!isDashboardRole(role)) {
    return { groups: [], items: [], quickAction: { label: 'Home', icon: Home, href: '/' } };
  }
  return navConfigByRole[role];
}

// Backward compat — returns flat item list
export function getNavItems(role: string): NavItem[] {
  return getNavConfig(role).items;
}

export type { NavConfig, NavItem } from './types';

export function isActivePath(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}
