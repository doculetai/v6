'use client';

import {
  ClipboardText,
  FileText,
  Gear,
  House,
  ShieldCheck,
  Trophy,
} from '@/components/icons';

import type { NavConfig } from './types';

export const studentNavConfig: NavConfig = {
  groups: [],
  items: [
    {
      label: 'Overview',
      href: '/dashboard/student',
      icon: House,
      description: 'Dashboard summary and next steps',
      isPrimary: true,
    },
    {
      label: 'Onboarding',
      href: '/dashboard/student/setup',
      icon: ClipboardText,
      description: 'Set up your school and funding type',
    },
    {
      label: 'Verification',
      href: '/dashboard/student/verification',
      icon: ShieldCheck,
      description: 'Verify your identity and bank account',
      disabledBeforeStage: 1,
      disabledReason: 'Complete your profile setup first',
    },
    {
      label: 'Documents',
      href: '/dashboard/student/documents',
      icon: FileText,
      description: 'Upload your bank statement',
      disabledBeforeStage: 1,
      disabledReason: 'Complete your profile setup first',
    },
    {
      label: 'Proof of Funds',
      href: '/dashboard/student/proof',
      icon: Trophy,
      description: 'View and share your certificate',
      isPrimary: true,
      disabledBeforeStage: 2,
      disabledReason: 'Complete verification and documents first',
    },
    {
      label: 'Settings',
      href: '/dashboard/student/settings',
      icon: Gear,
      description: 'Account and session settings',
    },
  ],
};

// Backward compat
export const studentNav = studentNavConfig.items;
