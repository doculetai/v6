import type { DashboardRole } from '@/config/roles';
import { routes } from '@/config/routes';
import type { StudentDocumentType } from '@/lib/documents';

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
    title: 'Notifications',
    empty: 'No notifications',
    markAllRead: 'Mark all as read',
    groups: {
      today: 'Today',
      yesterday: 'Yesterday',
      earlier: 'Earlier',
    },
    categoryGroups: {
      documents: 'Documents',
      verification: 'Verification',
      sponsor: 'Sponsor',
      certificate: 'Certificate',
      general: 'General',
    },
    relativeTime: {
      now: 'Just now',
      minutes: (n: number) => `${n}m ago`,
      hours: (n: number) => `${n}h ago`,
      days: (n: number) => `${n}d ago`,
    },
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
    errorTitle: 'Unable to load your dashboard',
    errorDescription: 'Please refresh this page to try again.',
  },
} as const;

export function getFallbackUserName(role: DashboardRole): string {
  return `${roleDisplayNames[role]} ${dashboardShellCopy.sidebar.fallbackUserNameSuffix}`;
}

export const studentHomeCopy = {
  welcomeTitle: (name: string) => `${name}'s application`,
  title: 'Overview',
  journeySubtitle: 'Your progress toward proof of funds.',
  tabs: {
    journey: 'Journey',
    activity: 'Activity',
    ariaLabel: 'Application progress',
  },
  firstTime: {
    eyebrow: 'Application',
    heading: 'No active application',
    description: 'Complete four steps to receive your proof of funds certificate.',
    cta: 'Begin your application',
    ctaHref: routes.dashboard.student.setup,
  },
  inProgress: {
    heading: 'Continue your application',
    description: 'You have outstanding steps. Resume where you left off.',
  },
  certified: {
    eyebrow: 'Certificate issued',
    heading: 'Proof of funds certificate issued',
    description: (name: string, school: string) =>
      `${name} — ${school}`,
    descriptionNoSchool: (name: string) => `Issued to ${name}`,
    cta: 'View your certificate',
    ctaHref: routes.dashboard.student.proof,
  },
  postCert: {
    heading: 'Your proof of funds is verified.',
    certCard: {
      eyebrow: 'Certificate',
      idLabel: 'Certificate ID',
      issuedLabel: 'Issued',
      viewCta: 'View certificate',
      viewHref: routes.dashboard.student.proof,
    },
  },
  schoolAlert: {
    message: 'Your selected school is no longer active. Contact support to continue your application.',
  },
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
      notStartedLabel: 'Not started',
      requiredSub: 'Link to verify your funds',
      selectProgramSub: 'Select a school and program first',
      balanceVsTarget: (balance: string, target: string) => `${balance} / ${target}`,
      verifiedBalanceLabel: (amount: string) => `Verified: ${amount}`,
    },
  },
  school: {
    sectionLabel: 'Institution',
    selectedLabel: 'Enrolled',
    notSelectedTitle: 'No institution selected',
    notSelectedDescription: 'Browse partner institutions to set your funding target.',
    ctaLabel: 'Browse schools',
    ctaHref: routes.dashboard.student.schools,
    programLabel: 'Programme',
    durationLabel: (months: number) => `${months} months`,
  },
  recentActivity: {
    sectionLabel: 'Activity',
    empty: 'No activity recorded yet.',
    emptyHeading: 'No activity yet',
      emptyDescription: 'Document uploads and verification events will appear here as you progress.',
    documentUploaded: (type: string) => `Uploaded ${type}`,
    documentApproved: (type: string) => `${type} approved`,
    documentRejected: (type: string) => `${type} needs attention`,
    documentPending: (type: string) => `${type} under review`,
    documentTypeLabels: {
      passport: 'Passport',
      bank_statement: 'Bank statement',
      offer_letter: 'Offer letter',
      affidavit: 'Affidavit',
      cac: 'CAC document',
    } as Record<StudentDocumentType, string>,
  },
  journey: {
    stages: {
      onboarding: 'Profile setup',
      verification: 'Verification',
      documents: 'Documents',
      proof: 'Certificate',
    },
    completionMessage: 'Your proof of funds is verified.',
    nextActions: {
      onboarding: {
        label: 'Profile setup',
        description: 'Choose your school and program to set your funding target.',
        cta: 'Set up your profile',
        href: routes.dashboard.student.setup,
      },
      verification: {
        label: 'Identity verification',
        description: 'Confirm your phone number, identity, and bank details.',
        cta: 'Continue verification',
        href: routes.dashboard.student.verification,
      },
      documents: {
        label: 'Bank statement',
        description: 'Upload a bank statement showing your available balance.',
        cta: 'Upload statement',
        href: routes.dashboard.student.documents,
      },
      proof: {
        label: 'Certificate',
        description: 'Your application is complete. Review your proof of funds certificate.',
        cta: 'View certificate',
        href: routes.dashboard.student.proof,
      },
    },
  },
} as const;

export const dashboardOverviewCopy: Record<DashboardRole, OverviewCopy> = {
  student: {
    title: 'Welcome back, Student',
    description: 'Review your funding progress and keep your verification timeline moving.',
    ctaLabel: 'Continue verification',
    ctaHref: routes.dashboard.student.verification,
  },
  sponsor: {
    title: 'Welcome back, Sponsor',
    description: 'Track commitments and confirm the next disbursement milestone with confidence.',
    ctaLabel: 'Review disbursements',
    ctaHref: routes.dashboard.sponsor.disbursements,
  },
  university: {
    title: 'Welcome back, University',
    description: 'Validate student funding records and clear pending enrollment decisions.',
    ctaLabel: 'Open pipeline',
    ctaHref: routes.dashboard.university.pipeline,
  },
  admin: {
    title: 'Welcome back, Admin',
    description: 'Keep platform operations healthy by reviewing active risk and support signals.',
    ctaLabel: 'Check operations',
    ctaHref: routes.dashboard.admin.operations,
  },
  agent: {
    title: 'Welcome back, Agent',
    description: 'Guide your active students through the next steps in their funding journey.',
    ctaLabel: 'Open student cases',
    ctaHref: routes.dashboard.agent.students,
  },
  partner: {
    title: 'Welcome back, Partner',
    description: 'Monitor embedded performance and move your institution integration forward.',
    ctaLabel: 'View integrations',
    ctaHref: routes.dashboard.partner.integrations,
  },
};
