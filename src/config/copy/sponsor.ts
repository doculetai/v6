import { commonErrors } from './shared';

export const sponsorCopy = {
  overview: {
    heading: 'Sponsor Dashboard',
    subheadingTemplate: 'Supporting [student name] on their journey to [university]',
    fallbackStudentName: 'your student',
    fallbackUniversityName: 'their chosen university',
    stats: {
      totalFunded: 'Total funded (₦)',
      activeStudents: 'Active students',
      pendingDisbursements: 'Pending disbursements',
      kycTier: 'KYC tier',
      tiers: {
        tier1: 'Tier 1 · Identity started',
        tier2: 'Tier 2 · Identity in progress',
        tier3: 'Tier 3 · Fully verified',
      },
    },
    recentActivity: {
      title: 'Recent activity',
      subtitle: 'Latest funding and verification updates across your sponsor account.',
      empty: {
        illustration: 'clock',
        heading: 'Your activity timeline is still quiet',
        description:
          'Once you link students, fund disbursements, or update KYC, each event will appear here.',
        cta: 'View linked students',
      },
    },
    studentPreview: {
      title: 'Linked students',
      subtitle: 'A quick look at current student progress and proof-of-funds stage.',
      cta: 'View all students',
      empty: {
        illustration: 'users',
        heading: 'Start by linking your first student',
        description:
          'Add a student profile to track tiers, status milestones, and upcoming disbursement needs.',
        cta: 'Open students',
      },
      statusLabels: {
        draft: 'Draft',
        submitted: 'Submitted',
        underReview: 'Under review',
        approved: 'Approved',
        certificateIssued: 'Certificate issued',
        rejected: 'Rejected',
        actionRequired: 'Action required',
        expired: 'Expired',
      },
      universityFallback: 'University not selected yet',
      tierLabelPrefix: 'Tier',
    },
  },

  students: {
    heading: 'Sponsored Students',
    subheading: 'Track each student from funding commitment to certificate issuance.',
    table: {
      studentName: 'Student',
      university: 'Target university',
      tier: 'Proof tier',
      status: 'Current status',
      nextAction: 'Next action',
    },
    empty: {
      illustration: 'users',
      heading: 'No students linked yet',
      description:
        'When a student accepts your sponsorship, their record appears here with live status updates.',
      cta: 'Invite a student',
    },
  },

  disbursements: {
    heading: 'Disbursements',
    subheading: 'Monitor each payment schedule with full traceability and confidence.',
    filters: {
      status: 'Filter by disbursement status',
      dateRange: 'Filter by date range',
    },
    table: {
      student: 'Student',
      amount: 'Amount (₦)',
      scheduleDate: 'Scheduled date',
      processedDate: 'Processed date',
      status: 'Status',
      reference: 'Reference',
    },
    empty: {
      illustration: 'wallet',
      heading: 'No disbursements yet',
      description:
        'Once funding is scheduled, each transfer and payment reference will appear in this feed.',
      cta: 'Link a student',
    },
  },

  transactions: {
    heading: 'Transactions',
    subheading: 'Complete ledger of sponsor debits, credits, and payment confirmations.',
    table: {
      transactionId: 'Transaction ID',
      type: 'Type',
      amount: 'Amount (₦)',
      date: 'Date',
      channel: 'Channel',
      status: 'Status',
    },
    empty: {
      illustration: 'receipt',
      heading: 'No transactions posted yet',
      description:
        'Your transaction ledger will populate automatically when payments and reversals occur.',
      cta: 'Go to disbursements',
    },
  },

  kyc: {
    heading: 'KYC Verification',
    subheading: 'Secure your sponsor profile with identity checks required for trusted funding.',
    checklist: {
      identityDocument: 'Government ID uploaded',
      faceMatch: 'Face match completed',
      bvnOrNin: 'BVN/NIN validated',
      reviewDecision: 'Compliance review decision',
    },
    status: {
      notStarted: 'Not started',
      pending: 'Under review',
      verified: 'Verified',
      failed: 'Action required',
    },
    cta: {
      start: 'Start verification',
      continue: 'Continue verification',
      retry: 'Retry verification',
    },
  },

  settings: {
    heading: 'Sponsor Settings',
    subheading: 'Manage account preferences, security posture, and funding notifications.',
    sections: {
      profile: 'Profile details',
      notifications: 'Notifications',
      security: 'Session security',
      preferences: 'Dashboard preferences',
    },
    security: {
      title: 'Session Security',
      subtitle: 'Review active sessions and respond quickly to suspicious login activity.',
      lastLogin: 'Last login',
      activeDevices: 'Active devices',
      suspiciousAlerts: 'Suspicious login alerts',
      cta: 'Manage sessions',
    },
  },

  nav: {
    overview: 'Overview',
    students: 'Students',
    disbursements: 'Disbursements',
    transactions: 'Transactions',
    kyc: 'KYC',
    settings: 'Settings',
  },

  errors: commonErrors,
} as const;

export type SponsorCopy = typeof sponsorCopy;
