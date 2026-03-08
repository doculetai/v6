import { CurrencyNgn, Gear, House, Pulse, UserPlus, Users } from '@/components/icons';
import { routes } from '@/config/routes';

import type { NavConfig } from './types';

export const agentNavConfig: NavConfig = {
  groups: [
    { id: 'work', label: 'My Work' },
    { id: 'account', label: 'Account' },
  ],
  items: [
    {
      label: 'Overview',
      href: routes.dashboard.agent.overview,
      icon: House,
      description: 'Pipeline and performance',
      isPrimary: true,
    },
    {
      label: 'Students',
      href: routes.dashboard.agent.students,
      icon: Users,
      description: 'Students you manage',
      group: 'work',
    },
    {
      label: 'Commissions',
      href: routes.dashboard.agent.commissions,
      icon: CurrencyNgn,
      description: 'Earnings and payouts',
      group: 'work',
    },
    {
      label: 'Activity',
      href: routes.dashboard.agent.activity,
      icon: Pulse,
      description: 'Recent actions and events',
      group: 'work',
    },
    {
      label: 'Settings',
      href: routes.dashboard.agent.settings,
      icon: Gear,
      description: 'Profile settings',
      group: 'account',
      mobileHidden: true,
    },
  ],
  quickAction: {
    label: 'Invite student',
    icon: UserPlus,
    href: routes.dashboard.agent.students,
  },
};

// Backward compat
export const agentNav = agentNavConfig.items;
