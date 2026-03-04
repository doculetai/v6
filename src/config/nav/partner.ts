import { BarChart3, Home, Key, Palette, Settings, Users } from 'lucide-react';

import type { NavConfig } from './types';

export const partnerNavConfig: NavConfig = {
  groups: [
    { id: 'platform', label: 'Platform' },
    { id: 'developer', label: 'Developer' },
    { id: 'account', label: 'Account' },
  ],
  items: [
    {
      label: 'Overview',
      href: '/dashboard/partner',
      icon: Home,
      description: 'Platform metrics',
      isPrimary: true,
    },
    {
      label: 'Students',
      href: '/dashboard/partner/students',
      icon: Users,
      description: 'Students on your platform',
      group: 'platform',
    },
    {
      label: 'Analytics',
      href: '/dashboard/partner/analytics',
      icon: BarChart3,
      description: 'Usage and conversion data',
      group: 'platform',
    },
    {
      label: 'API Keys',
      href: '/dashboard/partner/api-keys',
      icon: Key,
      description: 'Manage integration keys',
      group: 'developer',
    },
    {
      label: 'Branding',
      href: '/dashboard/partner/branding',
      icon: Palette,
      description: 'White-label customization',
      group: 'developer',
    },
    {
      label: 'Settings',
      href: '/dashboard/partner/settings',
      icon: Settings,
      description: 'Partner settings',
      group: 'account',
      mobileHidden: true,
    },
  ],
};

// Backward compat
export const partnerNav = partnerNavConfig.items;
