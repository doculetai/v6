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
  sidebar: {
    accountLabel: 'Account',
    logoutLabel: 'Log out',
    navAriaLabel: 'Dashboard navigation',
    fallbackUserNameSuffix: 'workspace',
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

