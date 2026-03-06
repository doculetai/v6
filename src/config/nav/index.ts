'use client';

import { House } from '@phosphor-icons/react';

import type { DashboardRole } from '@/config/roles';
import { isDashboardRole } from '@/config/roles';
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
    return { groups: [], items: [], quickAction: { label: 'Home', icon: House, href: '/' } };
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
