import { ArrowsClockwise, ChartBar, ClipboardText, Gear, House, Users, Warning } from '@/components/icons';
import { primitivesCopy } from '@/config/copy/primitives';
import { routes } from '@/config/routes';

import type { NavConfig } from './types';

export const adminNavConfig: NavConfig = {
  groups: [
    { id: 'ops', label: 'Operations' },
    { id: 'system', label: 'System' },
  ],
  items: [
    {
      label: primitivesCopy.nav.overview,
      href: routes.dashboard.admin.overview,
      icon: House,
      description: 'Platform health and metrics',
      isPrimary: true,
    },
    {
      label: 'Operations',
      href: routes.dashboard.admin.operations,
      icon: ArrowsClockwise,
      description: 'Live operational activity',
      group: 'ops',
    },
    {
      label: 'Analytics',
      href: routes.dashboard.admin.analytics,
      icon: ChartBar,
      description: 'Business intelligence',
      group: 'ops',
    },
    {
      label: 'Risk',
      href: routes.dashboard.admin.risk,
      icon: Warning,
      description: 'Risk and compliance flags',
      group: 'ops',
    },
    {
      label: 'Users',
      href: routes.dashboard.admin.users,
      icon: Users,
      description: 'Manage all users',
      group: 'system',
    },
    {
      label: 'Settings',
      href: routes.dashboard.admin.settings,
      icon: Gear,
      description: 'Platform configuration',
      group: 'system',
      mobileHidden: true,
    },
  ],
  quickAction: {
    label: 'Review queue',
    icon: ClipboardText,
    href: routes.dashboard.admin.operations,
  },
};

// Backward compat
export const adminNav = adminNavConfig.items;
