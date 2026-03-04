import { BarChart3, Building2, Home, PlugZap, Wallet } from 'lucide-react';

import type { NavItem } from './types';

export const partnerNav: NavItem[] = [
  { label: 'Overview', href: '/dashboard/partner', icon: Home },
  { label: 'Integrations', href: '/dashboard/partner/integrations', icon: PlugZap },
  { label: 'Clients', href: '/dashboard/partner/clients', icon: Building2 },
  { label: 'Analytics', href: '/dashboard/partner/analytics', icon: BarChart3 },
  { label: 'Billing', href: '/dashboard/partner/billing', icon: Wallet },
];
