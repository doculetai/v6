import { ChartBar, Gear, House, Key, PaintBrush } from '@phosphor-icons/react/dist/ssr';

import type { NavConfig } from './types';

export const partnerNavConfig: NavConfig = {
  groups: [
    { id: 'developer', label: 'Developer' },
    { id: 'account', label: 'Account' },
  ],
  items: [
    {
      label: 'Overview',
      href: '/dashboard/partner',
      icon: House,
      description: 'Platform metrics',
      isPrimary: true,
    },
    {
      label: 'API Keys',
      href: '/dashboard/partner/api-keys',
      icon: Key,
      description: 'Manage integration keys',
      group: 'developer',
    },
    {
      label: 'Analytics',
      href: '/dashboard/partner/analytics',
      icon: ChartBar,
      description: 'Usage and conversion data',
      group: 'developer',
    },
    {
      label: 'Branding',
      href: '/dashboard/partner/branding',
      icon: PaintBrush,
      description: 'White-label customization',
      group: 'developer',
    },
    {
      label: 'Settings',
      href: '/dashboard/partner/settings',
      icon: Gear,
      description: 'Partner settings',
      group: 'account',
      mobileHidden: true,
    },
  ],
  quickAction: {
    label: 'View API keys',
    icon: Key,
    href: '/dashboard/partner/api-keys',
  },
};

// Backward compat
export const partnerNav = partnerNavConfig.items;
