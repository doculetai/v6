import { Award, FileText, GraduationCap, Home, ShieldCheck } from 'lucide-react';

import type { NavItem } from './types';

export const studentNav: NavItem[] = [
  { label: 'Overview', href: '/dashboard/student', icon: Home },
  { label: 'Schools', href: '/dashboard/student/schools', icon: GraduationCap },
  { label: 'Verify', href: '/dashboard/student/verify', icon: ShieldCheck },
  { label: 'Documents', href: '/dashboard/student/documents', icon: FileText },
  { label: 'Proof', href: '/dashboard/student/proof', icon: Award },
];
