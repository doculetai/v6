import { ClipboardCheck, FileBadge2, GraduationCap, Home, LineChart } from 'lucide-react';

import type { NavItem } from './types';

export const universityNav: NavItem[] = [
  { label: 'Overview', href: '/dashboard/university', icon: Home },
  { label: 'Applications', href: '/dashboard/university/applications', icon: GraduationCap },
  { label: 'Verification', href: '/dashboard/university/verification', icon: ClipboardCheck },
  { label: 'Certificates', href: '/dashboard/university/certificates', icon: FileBadge2 },
  { label: 'Reports', href: '/dashboard/university/reports', icon: LineChart },
];
