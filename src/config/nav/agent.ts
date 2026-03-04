import { Activity, Coins, Home, Settings, Users, Zap } from 'lucide-react';

import type { NavConfig } from './types';

export const agentNavConfig: NavConfig = {
  groups: [
    { id: 'work', label: 'My Work' },
    { id: 'account', label: 'Account' },
  ],
  items: [
    {
      label: 'Overview',
      href: '/dashboard/agent',
      icon: Home,
      description: 'Pipeline and performance',
      isPrimary: true,
    },
    {
      label: 'Students',
      href: '/dashboard/agent/students',
      icon: Users,
      description: 'Students you manage',
      group: 'work',
    },
    {
      label: 'Activity',
      href: '/dashboard/agent/activity',
      icon: Activity,
      description: 'Recent actions and events',
      group: 'work',
    },
    {
      label: 'Commissions',
      href: '/dashboard/agent/commissions',
      icon: Coins,
      description: 'Earnings and payouts',
      group: 'work',
    },
    {
      label: 'Quick Actions',
      href: '/dashboard/agent/actions',
      icon: Zap,
      description: 'Shortcuts and bulk operations',
      group: 'work',
    },
    {
      label: 'Settings',
      href: '/dashboard/agent/settings',
      icon: Settings,
      description: 'Profile settings',
      group: 'account',
      mobileHidden: true,
    },
  ],
};

// Backward compat
export const agentNav = agentNavConfig.items;
