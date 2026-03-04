import { ClipboardCheck, HandCoins, Home, ReceiptText, Settings, Shield, Users } from 'lucide-react';

import type { NavConfig } from './types';

export const sponsorNavConfig: NavConfig = {
  groups: [
    { id: 'fund', label: 'Funding' },
    { id: 'account', label: 'Account' },
  ],
  items: [
    {
      label: 'Overview',
      href: '/dashboard/sponsor',
      icon: Home,
      description: 'Funding summary and activity',
      isPrimary: true,
    },
    {
      label: 'Students',
      href: '/dashboard/sponsor/students',
      icon: Users,
      description: 'Students you sponsor',
      group: 'fund',
    },
    {
      label: 'Disbursements',
      href: '/dashboard/sponsor/disbursements',
      icon: HandCoins,
      description: 'Fund transfers and schedules',
      group: 'fund',
    },
    {
      label: 'Transactions',
      href: '/dashboard/sponsor/transactions',
      icon: ReceiptText,
      description: 'Full transaction history',
      group: 'fund',
    },
    {
      label: 'KYC',
      href: '/dashboard/sponsor/kyc',
      icon: Shield,
      description: 'Identity verification status',
      group: 'account',
    },
    {
      label: 'Settings',
      href: '/dashboard/sponsor/settings',
      icon: Settings,
      description: 'Profile and preferences',
      group: 'account',
      mobileHidden: true,
    },
  ],
  quickAction: {
    label: 'Review requests',
    icon: ClipboardCheck,
    href: '/dashboard/sponsor/students',
  },
};

// Backward compat
export const sponsorNav = sponsorNavConfig.items;
