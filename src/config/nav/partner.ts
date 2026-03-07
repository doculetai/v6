import { ArrowsClockwise, ChartBar, FileText, Gear, House, Key, Palette, Users } from '@/components/icons';
import { routes } from '@/config/routes';

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
      href: routes.dashboard.partner.overview,
      icon: House,
      description: 'Platform metrics',
      isPrimary: true,
    },
    {
      label: 'Students',
      href: routes.dashboard.partner.students,
      icon: Users,
      description: 'Students on your platform',
      group: 'platform',
    },
    {
      label: 'Analytics',
      href: routes.dashboard.partner.analytics,
      icon: ChartBar,
      description: 'Usage and conversion data',
      group: 'platform',
    },
    {
      label: 'API Keys',
      href: routes.dashboard.partner.apiKeys,
      icon: Key,
      description: 'Manage integration keys',
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
      label: 'Webhooks',
      href: routes.dashboard.partner.webhooks,
      icon: ArrowsClockwise,
      description: 'Manage webhook endpoints',
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
  quickAction: {
    label: 'View students',
    icon: FileText,
    href: routes.dashboard.partner.students,
  },
};

// Backward compat
export const partnerNav = partnerNavConfig.items;
