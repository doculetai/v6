import { Building2, FileCheck2, Home, KanbanSquare, Settings } from 'lucide-react';

import type { NavConfig } from './types';

export const universityNavConfig: NavConfig = {
  groups: [
    { id: 'admissions', label: 'Admissions' },
    { id: 'account', label: 'Account' },
  ],
  items: [
    {
      label: 'Overview',
      href: '/dashboard/university',
      icon: Home,
      description: 'Admissions summary',
      isPrimary: true,
    },
    {
      label: 'Pipeline',
      href: '/dashboard/university/pipeline',
      icon: KanbanSquare,
      description: 'Applicant review pipeline',
      group: 'admissions',
    },
    {
      label: 'Students',
      href: '/dashboard/university/students',
      icon: Building2,
      description: 'Enrolled and admitted students',
      group: 'admissions',
    },
    {
      label: 'Documents',
      href: '/dashboard/university/documents',
      icon: FileCheck2,
      description: 'Document review queue',
      group: 'admissions',
    },
    {
      label: 'Settings',
      href: '/dashboard/university/settings',
      icon: Settings,
      description: 'Institution settings',
      group: 'account',
      mobileHidden: true,
    },
  ],
};

// Backward compat
export const universityNav = universityNavConfig.items;
