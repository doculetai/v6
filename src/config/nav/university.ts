import { Files, Gear, GraduationCap, House, ListChecks, Users } from '@/components/icons';
import { routes } from '@/config/routes';

import type { NavConfig } from './types';

export const universityNavConfig: NavConfig = {
  groups: [
    { id: 'admissions', label: 'Admissions' },
    { id: 'account', label: 'Account' },
  ],
  items: [
    {
      label: 'Overview',
      href: routes.dashboard.university.overview,
      icon: House,
      description: 'Enrolment summary',
      isPrimary: true,
    },
    {
      label: 'Programs',
      href: routes.dashboard.university.programs,
      icon: GraduationCap,
      description: 'Programme management',
      group: 'admissions',
    },
    {
      label: 'Students',
      href: routes.dashboard.university.students,
      icon: Users,
      description: 'Enrolled students',
      group: 'admissions',
    },
    {
      label: 'Documents',
      href: routes.dashboard.university.documents,
      icon: Files,
      description: 'Student document submissions',
      group: 'admissions',
    },
    {
      label: 'Settings',
      href: routes.dashboard.university.settings,
      icon: Gear,
      description: 'Institution settings',
      group: 'account',
      mobileHidden: true,
    },
  ],
  quickAction: {
    label: 'Review documents',
    icon: ListChecks,
    href: routes.dashboard.university.documents,
  },
};

// Backward compat
export const universityNav = universityNavConfig.items;
