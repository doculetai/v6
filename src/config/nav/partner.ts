import { ChartBar, Gear, House, LockKey, Palette, Users } from '@/components/icons';
import { primitivesCopy } from '@/config/copy/primitives';
import { routes } from '@/config/routes';

import type { NavConfig } from './types';

export const partnerNavConfig: NavConfig = {
  groups: [
    { id: 'developer', label: 'Developer' },
    { id: 'account', label: 'Account' },
  ],
  items: [
    {
      label: primitivesCopy.nav.overview,
      href: routes.dashboard.partner.overview,
      icon: House,
      description: 'Platform metrics',
      isPrimary: true,
    },
    {
      label: 'API Keys',
      href: routes.dashboard.partner.apiKeys,
      icon: LockKey,
      description: 'Manage integration keys',
      group: 'developer',
    },
    {
      label: 'Students',
      href: routes.dashboard.partner.students,
      icon: Users,
      description: 'Students through your integration',
      group: 'developer',
    },
    {
      label: 'Analytics',
      href: routes.dashboard.partner.analytics,
      icon: ChartBar,
      description: 'Usage and conversion data',
      group: 'developer',
    },
    {
      label: 'Branding',
      href: routes.dashboard.partner.branding,
      icon: Palette,
      description: 'White-label customization',
      group: 'developer',
    },
    {
      label: 'Settings',
      href: routes.dashboard.partner.settings,
      icon: Gear,
      description: 'Partner settings',
      group: 'account',
      mobileHidden: true,
    },
  ],
};

// Backward compat
export const partnerNav = partnerNavConfig.items;
