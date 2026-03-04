import { Activity, Home, Settings, ShieldAlert, Users } from 'lucide-react';

import type { NavItem } from './types';

export const adminNav: NavItem[] = [
  { label: 'Overview', href: '/dashboard/admin', icon: Home },
  { label: 'Operations', href: '/dashboard/admin/operations', icon: Activity },
  { label: 'Risk', href: '/dashboard/admin/risk', icon: ShieldAlert },
  { label: 'Users', href: '/dashboard/admin/users', icon: Users },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];
