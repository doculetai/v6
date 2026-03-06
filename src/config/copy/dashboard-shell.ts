import type { DashboardRole } from '@/config/roles';

type OverviewCopy = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export const roleDisplayNames: Record<DashboardRole, string> = {
  student: 'Student',
  sponsor: 'Sponsor',
  university: 'University',
  admin: 'Admin',
  agent: 'Agent',
  partner: 'Partner',
};

export const dashboardShellCopy = {
  brandName: 'Doculet',
  logoAlt: 'Doculet.ai logo',
  studentHome: {
    title: 'Your proof journey',
  },
  notifications: {
    ariaLabel: 'Notifications',
    empty: 'No notifications',
    markAllRead: 'Mark all as read',
  },
  notificationPreferences: {
    title: 'Notification preferences',
    subtitle: 'Choose how you receive updates.',
    email: 'Email',
    inApp: 'In-app',
    push: 'Push',
  },
  sidebar: {
    accountLabel: 'Account',
    logoutLabel: 'Log out',
    navAriaLabel: 'Dashboard navigation',
    fallbackUserNameSuffix: 'account',
    avatarFallback: 'DU',
    footerBrand: 'Doculet.ai',
    expandLabel: 'Expand sidebar',
    collapseLabel: 'Collapse sidebar',
    footerVersion: 'v1.0.0',
    footerStatus: 'Status',
    footerActive: 'Active',
  },
  topbar: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    navMenu: 'Navigation menu',
  },
  bottomNav: {
    navAriaLabel: 'Mobile dashboard navigation',
  },
  overview: {
    signedInLabel: 'Signed in as',
    noEmailFallback: 'No email address available',
    emptyTitle: 'Complete your profile to continue',
    emptyDescription:
      'Finish setting up your profile to see your verification progress and funding status.',
    errorTitle: 'We could not load your dashboard',
    errorDescription: 'Please refresh this page in a moment to try again.',
  },
} as const;

export function getFallbackUserName(role: DashboardRole): string {
  return `${roleDisplayNames[role]} ${dashboardShellCopy.sidebar.fallbackUserNameSuffix}`;
}

export const studentHomeCopy = {
  welcomeTitle: (name: string) => `Welcome, ${name}`,
  title: 'Your proof journey',
  journeySubtitle: 'Your proof-of-funds journey at a glance.',
  stats: {
    verification: {
      label: 'Verification',
      percent: (n: number) => `${n}%`,
      completionSuffix: 'complete',
      tierPassed: (n: number) => `Tier ${n} passed`,
      notStartedLabel: 'Not started',
    },
    documents: {
      label: 'Documents',
      countLabel: (submitted: number, total: number) => `${submitted} of ${total} submitted`,
      allApprovedLabel: 'All approved',
      approvedCount: (n: number) => `${n} approved`,
    },
    bankAccount: {
      label: 'Bank Account',
      linkedLabel: 'Linked',
      notLinkedLabel: 'Not linked',
      requiredSub: 'Required for disbursements',
    },
  },
  empty: {
    cta: 'Start onboarding',
  },
  school: {
    sectionLabel: 'Selected School',
    selectedLabel: 'Selected',
    notSelectedTitle: 'No school selected yet',
    notSelectedDescription: 'Browse partner institutions to set your funding target.',
    ctaLabel: 'Browse schools',
    ctaHref: '/dashboard/student/schools',
    programLabel: 'Program',
    durationLabel: (months: number) => `${months} months`,
  },
  nextSteps: {
    heading: 'Next Steps',
    items: {
      selectSchool: {
        label: 'Choose your school',
        description: 'Browse partner institutions and set your funding target.',
        cta: 'Browse schools',
        href: '/dashboard/student/schools',
      },
      verifyIdentity: {
        label: 'Verify your identity',
        description: 'Complete identity checks to unlock higher funding tiers.',
        cta: 'Continue verification',
        href: '/dashboard/student/verify',
      },
      uploadDocuments: {
        label: 'Upload your documents',
        description: 'Submit required documents for sponsor review.',
        cta: 'Upload now',
        href: '/dashboard/student/documents',
      },
      linkBankAccount: {
        label: 'Link your bank account',
        description: 'Connect your account to receive disbursements.',
        cta: 'Link account',
        href: '/dashboard/student/verify',
      },
    },
  },
  journey: {
    stages: {
      school: 'Select school',
      identity: 'Verify identity',
      documents: 'Upload documents',
      bank: 'Link bank',
      proof: 'View proof',
    },
    completionMessage: 'Your profile is complete and ready for sponsor review.',
  },
} as const;

export const dashboardOverviewCopy: Record<DashboardRole, OverviewCopy> = {
  student: {
    title: 'Welcome back, Student',
    description: 'Review your funding progress and keep your verification timeline moving.',
    ctaLabel: 'Continue verification',
    ctaHref: '/dashboard/student/verify',
  },
  sponsor: {
    title: 'Welcome back, Sponsor',
    description: 'Track commitments and confirm the next disbursement milestone with confidence.',
    ctaLabel: 'Review disbursements',
    ctaHref: '/dashboard/sponsor/disbursements',
  },
  university: {
    title: 'Welcome back, University',
    description: 'Validate student funding records and clear pending enrollment decisions.',
    ctaLabel: 'Open pipeline',
    ctaHref: '/dashboard/university/pipeline',
  },
  admin: {
    title: 'Welcome back, Admin',
    description: 'Keep platform operations healthy by reviewing active risk and support signals.',
    ctaLabel: 'Check operations',
    ctaHref: '/dashboard/admin/operations',
  },
  agent: {
    title: 'Welcome back, Agent',
    description: 'Guide your active students through the next steps in their funding journey.',
    ctaLabel: 'Open student cases',
    ctaHref: '/dashboard/agent/cases',
  },
  partner: {
    title: 'Welcome back, Partner',
    description: 'Monitor embedded performance and move your institution integration forward.',
    ctaLabel: 'View integrations',
    ctaHref: '/dashboard/partner/integrations',
  },
};

