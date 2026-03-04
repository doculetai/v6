import { Activity, BarChart3, ClipboardCheck, Home, Settings, ShieldAlert, Users } from 'lucide-react';

import type { NavConfig } from './types';

export const adminNavConfig: NavConfig = {
  groups: [
    { id: 'ops', label: 'Operations' },
    { id: 'system', label: 'System' },
  ],
  items: [
    {
      label: 'Overview',
      href: '/dashboard/admin',
      icon: Home,
      description: 'Platform health and metrics',
      isPrimary: true,
    },
    {
      label: 'Operations',
      href: '/dashboard/admin/operations',
      icon: Activity,
      description: 'Live operational activity',
      group: 'ops',
    },
    {
      label: 'Analytics',
      href: '/dashboard/admin/analytics',
      icon: BarChart3,
      description: 'Business intelligence',
      group: 'ops',
    },
    {
      label: 'Risk',
      href: '/dashboard/admin/risk',
      icon: ShieldAlert,
      description: 'Risk and compliance flags',
      group: 'ops',
    },
    {
      label: 'Users',
      href: '/dashboard/admin/users',
      icon: Users,
      description: 'Manage all users',
      group: 'system',
    },
    {
      label: 'Settings',
      href: '/dashboard/admin/settings',
      icon: Settings,
      description: 'Platform configuration',
      group: 'system',
      mobileHidden: true,
    },
  ],
  quickAction: {
    label: 'Review queue',
    icon: ClipboardCheck,
    href: '/dashboard/admin/operations',
  },
};

// Backward compat
export const adminNav = adminNavConfig.items;
