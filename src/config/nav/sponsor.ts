import { HandCoins, Home, ReceiptText, Settings, Users } from 'lucide-react';

import type { NavItem } from './types';

export const sponsorNav: NavItem[] = [
  { label: 'Overview', href: '/dashboard/sponsor', icon: Home },
  { label: 'Students', href: '/dashboard/sponsor/students', icon: Users },
  { label: 'Disbursements', href: '/dashboard/sponsor/disbursements', icon: HandCoins },
  { label: 'Transactions', href: '/dashboard/sponsor/transactions', icon: ReceiptText },
  { label: 'Settings', href: '/dashboard/sponsor/settings', icon: Settings },
];
