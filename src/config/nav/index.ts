'use client';

import { House } from '@/components/icons';

import type { DashboardRole } from '@/config/roles';
import { isDashboardRole } from '@/config/roles';
import { routes } from '@/config/routes';
import type { StudentTrustStage } from '@/lib/student-trust-stage';

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

type GetNavConfigOptions = {
  studentTrustStage?: StudentTrustStage;
};

export function getNavConfig(role: string, options: GetNavConfigOptions = {}): NavConfig {
  if (!isDashboardRole(role)) {
    return { groups: [], items: [], quickAction: { label: 'Home', icon: House, href: routes.home } };
  }
  const config = navConfigByRole[role];

  if (role === 'student' && options.studentTrustStage !== undefined) {
    const stage = options.studentTrustStage;
    const items = config.items.map((item) => {
      if (item.disabledBeforeStage !== undefined && stage < item.disabledBeforeStage) {
        return { ...item, disabled: true };
      }
      return item;
    });
    return { ...config, items };
  }

  return config;
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

// Mobile tab bar — 4 items per role, matched by href slug (last path segment,
// or 'overview' for the role root). Order determines tab order left-to-right.
export const mobileNavKeys: Record<DashboardRole, string[]> = {
  student:    ['overview', 'documents', 'proof', 'settings'],
  sponsor:    ['overview', 'students', 'commitments', 'settings'],
  university: ['overview', 'students', 'programs', 'settings'],
  admin:      ['overview', 'operations', 'users', 'settings'],
  agent:      ['overview', 'students', 'activity', 'settings'],
  partner:    ['overview', 'api-keys', 'analytics', 'settings'],
};

// Derive the mobile tab key from a nav item's href.
// The role root href (e.g. /dashboard/student) maps to 'overview'.
// All other hrefs yield their last path segment.
export function getMobileNavKey(href: string, role: DashboardRole): string {
  const roleRoot = `/dashboard/${role}`;
  if (href === roleRoot) return 'overview';
  const segments = href.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? 'overview';
}
