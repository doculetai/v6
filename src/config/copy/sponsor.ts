import { routes } from '@/config/routes';
import { commonErrors } from "./shared";

export const sponsorCopy = {
  onboarding: {
    title: "Set up your sponsor account",
    subtitle: "A few details so we can match you with students and track your commitments.",
    steps: {
      welcome: {
        title: "Welcome",
        heading: "Thank you for choosing to sponsor education",
        description: "Doculet connects you with verified students and provides full transparency on how your funds are used. Every naira is tracked from commitment to disbursement.",
        cta: "Continue",
      },
      profile: {
        title: "Your details",
        heading: "Tell us about yourself",
        description: "This information helps students and institutions verify your identity.",
        sponsorTypeLabel: "Sponsor type",
        sponsorTypeOptions: {
          individual: { label: "Individual", description: "I am sponsoring as a private individual or family member." },
          corporate: { label: "Organisation", description: "I am sponsoring on behalf of a company or institution." },
        },
        companyNameLabel: "Organisation name",
        companyNamePlaceholder: "Enter your organisation name",
        cta: "Save and continue",
      },
      complete: {
        title: "Ready",
        heading: "Your account is ready",
        description: "You can now review student invitations and commit funds. Your dashboard shows all your sponsorship activity in one place.",
        cta: "Go to dashboard",
      },
    },
    progress: "{current} of {total}",
  },
  dashboard: {
    title: "Sponsor dashboard",
    subtitle: "Fund education with confidence. Every naira tracked.",
    overview: {
      welcomeTitle: (name: string) => `Welcome back, ${name}`,
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
        empty: "No active sponsorships yet. Review pending student requests to begin.",
        unknownStudentLabel: "Unknown",
      },
      cta: "Review pending requests",
      pendingInvitesBanner: {
        message: "You have pending invites from students waiting for your review.",
        cta: "Review invites",
        href: routes.dashboard.sponsor.students,
      },
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
    backToStudents: "Back to students",
    nextDisbursement: "Next disbursement",
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
        tierHeading: "Tier 1",
        label: "Basic",
        description: "Email and phone number confirmation.",
      },
      {
        tierHeading: "Tier 2",
        label: "Standard",
        description: "BVN or NIN verification for fund commitments up to ₦10,000,000.",
      },
      {
        tierHeading: "Tier 3",
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
    overallStatusLabel: "KYC status",
    identityTypes: {
      bvn: "BVN",
      nin: "NIN",
      passport: "International Passport",
    },
    form: {
      identityTypeLabel: "Identity type",
      identityNumberLabel: "Identity number",
      submitCta: "Submit",
      cancelCta: "Cancel",
    },
    feedback: {
      started: "Verification submitted. We will update your status after provider confirmation.",
      error: "Unable to start verification. Please try again.",
    },
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
      actions: "Actions",
    },
    statusLabels: {
      all: "All",
      pending: "Pending",
      scheduled: "Scheduled",
      processing: "Processing",
      completed: "Completed",
      disbursed: "Disbursed",
      failed: "Failed",
    },
    downloadStatement: "Download statement",
    filterByStatus: "Filter by status",
    actions: {
      pay: "Initiate payment",
      payingCta: "Initiating...",
      cancel: "Cancel",
      cancelConfirmTitle: "Cancel this disbursement?",
      cancelConfirmDescription: "The scheduled payment will not be processed. You can initiate a new payment later.",
      cancelConfirmCta: "Cancel disbursement",
      cancelSuccess: "Disbursement cancelled.",
    },
    feedback: {
      initiateSuccess: "Payment initiated. Status will update when the transfer completes.",
      initiateError: "Unable to initiate payment. Please try again.",
    },
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
      empty: { title: 'No active sponsorships', description: 'Accept a student request to begin.' },
      student: 'Student',
      amount: 'Amount',
      status: 'Status',
      since: 'Since',
      actions: 'Actions',
      updateAmount: 'Update amount',
      cancelSponsorship: 'Cancel sponsorship',
      cancelConfirmTitle: 'Cancel this sponsorship?',
      cancelConfirmDescription: 'The student will be notified and will need to find alternative funding. This action cannot be undone.',
      cancelConfirmCta: 'Cancel sponsorship',
      cancelSuccess: 'Sponsorship cancelled.',
      updateAmountTitle: 'Update commitment amount',
      updateAmountCta: 'Save',
      updateAmountSuccess: 'Commitment amount updated.',
    },
    statusLabels: {
      pending: 'Pending',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
      withdrawn: 'Withdrawn',
    },
  },

  commitments: {
    title: 'Commitments',
    subtitle: 'Your financial pledges and commitment status.',
    empty: { title: 'No commitments yet', description: 'Commit to a student to fund their education.' },
    table: {
      student: 'Student',
      amount: 'Amount',
      status: 'Status',
      since: 'Since',
    },
    statusLabels: { pending: 'Pending', active: 'Active', completed: 'Completed', cancelled: 'Cancelled', withdrawn: 'Withdrawn' },
  },
  impact: {
    title: 'Impact',
    subtitle: 'Summary of your contribution to student success.',
    empty: { title: 'No impact data yet', description: 'Your contribution summary will appear after you sponsor students.' },
    stats: {
      totalDisbursed: 'Total disbursed',
      studentsHelped: 'Students helped',
      certificatesIssued: 'Certificates issued',
      activeCommitments: 'Active commitments',
      completedCommitments: 'Completed commitments',
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
      sponsorTypes: { individual: 'Individual', corporate: 'Organisation', self: 'Paying for own education' },
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
      comingSoon: "You\u2019ll be able to fine-tune your notification preferences here. In the meantime, we\u2019ll email you for all critical account activity.",
      items: {
        disbursement: { label: 'Disbursement updates', description: 'When a payment is processed or fails' },
        studentMilestone: { label: 'Student milestones', description: 'When your sponsored student completes a verification tier' },
        inviteResponse: { label: 'Invite responses', description: 'When a student accepts or declines your invite' },
        security: { label: 'Account security', description: 'Login alerts and account changes' },
      },
    },
    errors: {
      profileSaveError: 'Failed to save profile. Please try again.',
      loadError: 'Unable to load settings. Please try again.',
      tryAgain: 'Try again',
    },
  },

  journey: {
    stages: {
      review_invites: 'Review invitations',
      commit_funds: 'Commit funds',
      track_disbursements: 'Track disbursements',
      view_certificates: 'View certificates',
    },
    nextActions: {
      review_invites: {
        label: 'Review pending invitations',
        description: 'Students have requested your support. Review their profiles and respond.',
        cta: 'Review students',
        href: routes.dashboard.sponsor.students,
      },
      commit_funds: {
        label: 'Fund a student',
        description: 'Commit funds to an accepted student to begin the disbursement process.',
        cta: 'View students',
        href: routes.dashboard.sponsor.students,
      },
      track_disbursements: {
        label: 'Monitor disbursements',
        description: 'Track the progress of your scheduled fund transfers.',
        cta: 'View disbursements',
        href: routes.dashboard.sponsor.disbursements,
      },
      view_certificates: {
        label: 'Review issued certificates',
        description: 'View proof-of-funds certificates issued for your sponsored students.',
        cta: 'View students',
        href: routes.dashboard.sponsor.students,
      },
    },
    completionMessage: 'All sponsorships are active and disbursements on track.',
  },

  welcome: {
    title: 'Welcome to Doculet',
    subtitle: 'Here is how sponsoring works on Doculet.',
    steps: [
      { label: 'Review student requests', description: 'Students will invite you to sponsor their education. Review and accept invitations from the Students page.' },
      { label: 'Commit funding', description: 'Set the amount you are committing per student. Funds are tracked transparently through the platform.' },
      { label: 'Track disbursements', description: 'Monitor scheduled payments and view proof-of-funds certificates once students are verified.' },
    ],
    dismiss: 'Got it',
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
