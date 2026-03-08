import { Gear, GraduationCap, House, Kanban, ListChecks, Users } from '@/components/icons';
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
      label: 'Pipeline',
      href: routes.dashboard.university.pipeline,
      icon: Kanban,
      description: 'Applicant pipeline',
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
      label: 'Programs',
      href: routes.dashboard.university.programs,
      icon: GraduationCap,
      description: 'Programme management',
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
    label: 'View pipeline',
    icon: ListChecks,
    href: routes.dashboard.university.pipeline,
  },
};

// Backward compat
export const universityNav = universityNavConfig.items;
