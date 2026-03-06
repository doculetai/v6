'use client';

import { ArrowRight, Trophy, FileText, GraduationCap, House, Gear, Question, ShieldCheck } from '@phosphor-icons/react';

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
      icon: House,
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
      disabledBeforeStage: 1,
      disabledReason: 'Complete your application setup first',
    },
    {
      label: 'Documents',
      href: '/dashboard/student/documents',
      icon: FileText,
      description: 'Upload and manage your documents',
      group: 'journey',
      disabledBeforeStage: 1,
      disabledReason: 'Complete your application setup first',
    },
    {
      label: 'Proof of Funds',
      href: '/dashboard/student/proof',
      icon: Trophy,
      description: 'View and share your certificate',
      group: 'credentials',
      isPrimary: true,
      disabledBeforeStage: 2,
      disabledReason: 'Complete verification and documents first',
    },
    {
      label: 'Support',
      href: '/dashboard/student/support',
      icon: Question,
      description: 'Get help with your proof journey',
    },
    {
      label: 'Settings',
      href: '/dashboard/student/settings',
      icon: Gear,
      description: 'Account and session settings',
    },
  ],
  quickAction: {
    label: 'Continue application',
    icon: ArrowRight,
    href: '/dashboard/student/schools',
  },
};

// Backward compat
export const studentNav = studentNavConfig.items;
