import { Gear, GraduationCap, House, Users } from '@/components/icons';
import { primitivesCopy } from '@/config/copy/primitives';
import { routes } from '@/config/routes';

import type { NavConfig } from './types';

export const universityNavConfig: NavConfig = {
  groups: [
    { id: 'admissions', label: 'Admissions' },
    { id: 'account', label: 'Account' },
  ],
  items: [
    {
      label: primitivesCopy.nav.overview,
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
      label: 'Settings',
      href: routes.dashboard.university.settings,
      icon: Gear,
      description: 'Institution settings',
      group: 'account',
      mobileHidden: true,
    },
  ],
};

// Backward compat
export const universityNav = universityNavConfig.items;
