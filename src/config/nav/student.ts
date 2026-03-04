import { Award, FileText, GraduationCap, Home, ShieldCheck } from 'lucide-react';

import type { NavConfig } from './types';

export const studentNavConfig: NavConfig = {
  groups: [
    { id: 'journey', label: 'My Journey' },
    { id: 'credentials', label: 'Credentials' },
  ],
  items: [
    {
      label: 'Overview',
      href: '/dashboard/student',
      icon: Home,
      description: 'Dashboard summary and next steps',
      isPrimary: true,
    },
    {
      label: 'Schools',
      href: '/dashboard/student/schools',
      icon: GraduationCap,
      description: 'Browse and apply to programs',
      group: 'journey',
    },
    {
      label: 'Verify',
      href: '/dashboard/student/verify',
      icon: ShieldCheck,
      description: 'Identity and KYC verification',
      group: 'journey',
    },
    {
      label: 'Documents',
      href: '/dashboard/student/documents',
      icon: FileText,
      description: 'Upload and manage your documents',
      group: 'journey',
    },
    {
      label: 'Proof of Funds',
      href: '/dashboard/student/proof',
      icon: Award,
      description: 'View and share your certificate',
      group: 'credentials',
      isPrimary: true,
    },
  ],
};

// Backward compat
export const studentNav = studentNavConfig.items;
