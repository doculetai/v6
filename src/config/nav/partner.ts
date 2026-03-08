import {
  ChartBar,
  FileText,
  Gear,
  House,
  Key,
  PaintBrush,
  Users,
  WebhooksLogo,
} from '@phosphor-icons/react/dist/ssr';

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
      icon: House,
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
      icon: ChartBar,
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
      label: 'Webhooks',
      href: '/dashboard/partner/webhooks',
      icon: WebhooksLogo,
      description: 'Configure event endpoints',
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
    label: 'View students',
    icon: FileText,
    href: '/dashboard/partner/students',
  },
};

// Backward compat
export const partnerNav = partnerNavConfig.items;
