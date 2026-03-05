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
  logoAlt: 'Doculet.ai logo',
  studentHome: {
    title: 'Your proof journey',
  },
  sidebar: {
    accountLabel: 'Account',
    logoutLabel: 'Log out',
    navAriaLabel: 'Dashboard navigation',
    fallbackUserNameSuffix: 'account',
    avatarFallback: 'DU',
  },
  bottomNav: {
    navAriaLabel: 'Mobile dashboard navigation',
  },
  overview: {
    signedInLabel: 'Signed in as',
    noEmailFallback: 'No email address available',
    emptyTitle: 'Profile setup still in progress',
    emptyDescription:
      'Finish your onboarding details to unlock your personalized dashboard experience.',
    errorTitle: 'We could not load your dashboard',
    errorDescription: 'Please refresh this page in a moment to try again.',
  },
} as const;

export function getFallbackUserName(role: DashboardRole): string {
  return `${roleDisplayNames[role]} ${dashboardShellCopy.sidebar.fallbackUserNameSuffix}`;
}

export const studentHomeCopy = {
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
    },
    bankAccount: {
      label: 'Bank Account',
      linkedLabel: 'Linked',
      notLinkedLabel: 'Not linked',
    },
  },
  empty: {
    cta: 'Start onboarding',
  },
  school: {
    sectionLabel: 'Selected School',
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
    ctaLabel: 'Open verification queue',
    ctaHref: '/dashboard/university/verification',
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

