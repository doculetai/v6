import { commonErrors } from "./shared";

export const sponsorCopy = {
  dashboard: {
    title: "Sponsor dashboard",
    subtitle: "Fund education with confidence. Every naira tracked.",
    overview: {
      subtitle: "Track your commitments and upcoming disbursements.",
      stats: {
        totalCommitted: { label: "Total Committed", sub: "across active sponsorships" },
        activeStudents: { label: "Active Students", sub: "currently sponsored" },
        pendingInvites: { label: "Pending Invites", sub: "awaiting your response" },
        nextDisbursement: {
          label: "Next Disbursement",
          noneValue: "None scheduled",
          noneSub: "accept a sponsorship first",
          scheduledSub: "scheduled date",
        },
      },
      recentStudents: {
        heading: "Recent Students",
        empty: "No active sponsorships yet. Review pending student requests to get started.",
        unknownStudentLabel: "Unknown",
      },
      cta: "Review pending requests",
    },
    stats: {
      totalCommitted: "Total committed (₦)",
      studentsSupported: "Students supported",
      pendingDisbursements: "Pending disbursements",
      certificatesIssued: "Certificates issued",
    },
    recentActivity: {
      title: "Recent activity",
      empty: {
        title: "No activity yet",
        description:
          "Your funding activity will appear here once you commit to your first student.",
      },
    },
    pendingRequests: {
      title: "Pending invitations",
      empty: {
        title: "No pending invitations",
        description: "Student invitations you receive will appear here.",
      },
      accept: "Accept",
      decline: "Decline",
    },
  },

  studentDetail: {
    title: "Student profile",
    subtitle: "Review funding requirements and verification status.",
    sections: {
      profile: "Personal details",
      school: "School & program",
      fundingRequirements: "Funding requirements",
      documents: "Submitted documents",
      status: "Verification status",
    },
    commitFunds: {
      title: "Commit funds",
      amountLabel: "Amount (₦)",
      amountHint: "e.g. ₦500,000",
      cta: "Commit funds",
      confirmTitle: "Confirm your commitment",
      confirmDescription:
        "By committing, you agree to provide these funds for the student's education. You'll be asked to sign a supporting affidavit.",
      confirmCta: "Confirm commitment",
      cancel: "Cancel",
      success: "Funds committed successfully.",
    },
    statusLabels: {
      pending: "Pending verification",
      verified: "Verified",
      rejected: "Verification failed",
    },
  },

  kyc: {
    title: "Verify your identity",
    subtitle:
      "We verify all sponsors to protect students and ensure regulatory compliance.",
    tiers: [
      {
        label: "Basic",
        description: "Email and phone number confirmation.",
      },
      {
        label: "Standard",
        description: "BVN or NIN verification for fund commitments up to ₦10,000,000.",
      },
      {
        label: "Enhanced",
        description:
          "Government ID upload and selfie check required for commitments above ₦10,000,000.",
      },
    ],
    status: {
      notStarted: "Not verified",
      inProgress: "Verification in progress",
      verified: "Verified",
      failed: "Verification failed",
    },
    startCta: "Start verification",
    retryLabel: "Try again",
  },

  disbursements: {
    title: "Disbursements",
    subtitle: "Track all fund transfers to students and institutions.",
    empty: {
      title: "No disbursements yet",
      description:
        "Your disbursement history will appear here once you commit funds to a student.",
    },
    table: {
      student: "Student",
      amount: "Amount (₦)",
      date: "Date",
      scheduled: "Scheduled",
      status: "Status",
      reference: "Reference",
    },
    statusLabels: {
      all: "All",
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      failed: "Failed",
    },
    downloadStatement: "Download statement",
    filterByStatus: "Filter by status",
  },

  students: {
    title: 'Your students',
    subtitle: 'Manage your sponsorships and pending student requests.',
    tabs: {
      pending: 'Pending requests',
      active: 'Active sponsorships',
    },
    pending: {
      empty: { title: 'No pending requests', description: 'Student invitation requests will appear here.' },
      accept: 'Accept',
      decline: 'Decline',
      message: 'Message',
      noMessage: 'No message provided',
      receivedLabel: 'Received',
    },
    active: {
      empty: { title: 'No active sponsorships', description: 'Accept a student request to get started.' },
      amount: 'Amount',
      status: 'Status',
      since: 'Since',
    },
    statusLabels: {
      pending: 'Pending',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
  },

  transactions: {
    title: 'Transactions',
    subtitle: 'Completed fund transfers to students.',
    empty: { title: 'No transactions yet', description: 'Completed disbursements will appear here.' },
    table: { student: 'Student', amount: 'Amount', disbursedAt: 'Date', reference: 'Reference' },
    summary: {
      totalDisbursed: 'Total disbursed',
      countLabel: 'Transactions',
      count: (n: number) => `${n} transaction${n === 1 ? '' : 's'}`,
    },
  },

  settings: {
    title: 'Settings',
    subtitle: 'Manage your sponsor profile and notification preferences.',
    profile: {
      title: 'Sponsor profile',
      sponsorTypeLabel: 'Sponsor type',
      sponsorTypes: { individual: 'Individual', corporate: 'Corporate', self: 'Self-funded' },
      companyNameLabel: 'Company name',
      companyNameHint: 'Required for corporate sponsors',
      kycStatusLabel: 'KYC status',
      saveLabel: 'Save changes',
      savingLabel: 'Saving…',
      savedLabel: 'Saved',
    },
    notifications: {
      title: 'Notifications',
      description: 'Choose which updates you receive by email and in-app alert.',
      items: {
        disbursement: { label: 'Disbursement updates', description: 'When a payment is processed or fails' },
        studentMilestone: { label: 'Student milestones', description: 'When your sponsored student completes a verification tier' },
        inviteResponse: { label: 'Invite responses', description: 'When a student accepts or declines your invite' },
        security: { label: 'Account security', description: 'Login alerts and account changes' },
      },
    },
    errors: {
      profileSaveError: 'Failed to save profile. Please try again.',
    },
  },

  nav: {
    dashboard: "Dashboard",
    students: "Students",
    disbursements: "Disbursements",
    kyc: "Verification",
    settings: "Settings",
  },

  errors: commonErrors,
} as const;

export type SponsorCopy = typeof sponsorCopy;
