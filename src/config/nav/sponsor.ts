import { ClipboardText, Gear, House, Receipt, Shield, Users } from '@/components/icons';
import { routes } from '@/config/routes';

import type { NavConfig } from './types';

export const sponsorNavConfig: NavConfig = {
  groups: [
    { id: 'fund', label: 'Funding' },
    { id: 'account', label: 'Account' },
  ],
  items: [
    {
      label: 'Overview',
      href: routes.dashboard.sponsor.overview,
      icon: House,
      description: 'Funding summary and activity',
      isPrimary: true,
    },
    {
      label: 'Students',
      href: routes.dashboard.sponsor.students,
      icon: Users,
      description: 'Students you sponsor',
      group: 'fund',
    },
    {
      label: 'Transactions',
      href: routes.dashboard.sponsor.transactions,
      icon: Receipt,
      description: 'Full transaction history',
      group: 'fund',
    },
    {
      label: 'KYC',
      href: routes.dashboard.sponsor.kyc,
      icon: Shield,
      description: 'Identity verification status',
      group: 'account',
    },
    {
      label: 'Settings',
      href: routes.dashboard.sponsor.settings,
      icon: Gear,
      description: 'Profile and preferences',
      group: 'account',
      mobileHidden: true,
    },
  ],
  quickAction: {
    label: 'Review requests',
    icon: ClipboardText,
    href: routes.dashboard.sponsor.students,
  },
};

// Backward compat
export const sponsorNav = sponsorNavConfig.items;
