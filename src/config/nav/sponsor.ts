import { CreditCard, Gear, Handshake, House, Receipt, Users } from '@/components/icons';
import { primitivesCopy } from '@/config/copy/primitives';
import { routes } from '@/config/routes';

import type { NavConfig } from './types';

export const sponsorNavConfig: NavConfig = {
  groups: [
    { id: 'fund', label: 'Funding' },
    { id: 'account', label: 'Account' },
  ],
  items: [
    {
      label: primitivesCopy.nav.overview,
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
      label: 'Commitments',
      href: routes.dashboard.sponsor.commitments,
      icon: Handshake,
      description: 'Your funding commitments',
      group: 'fund',
    },
    {
      label: 'Payments',
      href: routes.dashboard.sponsor.transactions,
      icon: CreditCard,
      description: 'Payment history',
      group: 'fund',
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
    label: 'View commitments',
    icon: Handshake,
    href: routes.dashboard.sponsor.commitments,
  },
};

// Backward compat
export const sponsorNav = sponsorNavConfig.items;
