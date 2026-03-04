import { commonErrors } from "./shared";

export const agentCopy = {
  dashboard: {
    title: "Agent dashboard",
    subtitle: "Grow your student portfolio. Earn on every verification.",
    overview: {
      subtitle: "Guide your active students through their funding journey.",
      stats: {
        assignedStudents: { label: "Assigned Students", sub: "in your caseload" },
        activeStudents: { label: "Active Students", sub: "verified and funded" },
        pendingCommissions: { label: "Pending Commissions", sub: "awaiting payout" },
        totalEarned: { label: "Total Earned", sub: "lifetime commissions paid" },
      },
      caseload: {
        filledSingle: (n: number) =>
          `You have ${n} student in your caseload. Keep their journey moving forward.`,
        filledPlural: (n: number) =>
          `You have ${n} students in your caseload. Keep their journeys moving forward.`,
        empty: "No students assigned yet. Use the Actions page to invite your first student.",
      },
      cta: "View your students",
    },
    stats: {
      totalStudents: "Students in portfolio",
      activeStudents: "Active students",
      pendingCommissions: "Pending commissions (₦)",
      totalEarned: "Total earned (₦)",
    },
    studentList: {
      title: "Your students",
      search: "Search students…",
      table: {
        name: "Name",
        stage: "Stage",
        school: "School",
        status: "Status",
        lastUpdated: "Last updated",
        action: "Action",
      },
      stages: {
        onboarding: "Onboarding",
        verifying: "Verifying",
        sponsorPending: "Awaiting sponsor",
        certificateReady: "Certificate ready",
        complete: "Complete",
      },
      empty: {
        title: "No students yet",
        description:
          "Share your referral link to onboard your first student and start earning commissions.",
        cta: "Get referral link",
      },
    },
    recentActivity: {
      title: "Recent activity",
      empty: {
        title: "No activity yet",
        description:
          "Student activity will appear here as they complete verification steps.",
      },
    },
  },

  commissions: {
    title: "Commissions",
    subtitle: "Your earnings from student verifications and certificate issuances.",
    stats: {
      pendingPayout: "Pending payout (₦)",
      paidThisMonth: "Paid this month (₦)",
      totalLifetime: "Lifetime earnings (₦)",
    },
    table: {
      student: "Student",
      event: "Event",
      amount: "Amount (₦)",
      date: "Date",
      status: "Status",
    },
    eventLabels: {
      kycComplete: "KYC complete",
      certificateIssued: "Certificate issued",
      sponsorCommitted: "Sponsor committed",
      referralBonus: "Referral bonus",
    },
    statusLabels: {
      pending: "Pending",
      processing: "Processing",
      paid: "Paid",
      cancelled: "Cancelled",
    },
    empty: {
      title: "No commissions yet",
      description:
        "Your commission history will appear here as students complete milestones.",
    },
    error: {
      title: "Failed to load commissions",
      description: "Please refresh the page.",
    },
    requestPayout: "Request payout",
    payoutDialog: {
      title: "Request payout",
      description: "Payouts are processed within 2 business days.",
      amountLabel: "Available balance (₦)",
      bankAccountLabel: "Payout account",
      confirmCta: "Confirm payout request",
      cancel: "Cancel",
    },
    downloadStatement: "Download statement",
  },

  referral: {
    title: "Referral programme",
    subtitle: "Share your link and earn when students complete their proof of funds.",
    linkSection: {
      title: "Your referral link",
      description:
        "Every student who signs up with your link is tracked to your portfolio automatically.",
      copyLinkCta: "Copy link",
      linkCopied: "Copied!",
    },
    stats: {
      totalReferrals: "Total referrals",
      converted: "Converted",
      conversionRate: "Conversion rate",
    },
    howItWorks: {
      title: "How it works",
      steps: [
        {
          label: "Share your link",
          description: "Send your unique referral link to prospective students.",
        },
        {
          label: "Student signs up",
          description: "They create an account automatically linked to your portfolio.",
        },
        {
          label: "Earn commissions",
          description: "You earn ₦15,000 for each certificate successfully issued.",
        },
      ],
    },
    table: {
      student: "Student",
      signedUp: "Signed up",
      stage: "Current stage",
      commission: "Commission (₦)",
    },
    empty: {
      title: "No referrals yet",
      description: "Share your link to start building your portfolio.",
    },
  },

  settings: {
    title: "Settings",
    subtitle: "Manage your agent profile and notification preferences.",

    profile: {
      sectionTitle: "Agent profile",
      sectionDescription:
        "Your contact and accreditation details visible to Doculet administrators.",
      fullNameLabel: "Full name",
      fullNamePlaceholder: "e.g. Adeyemi, John O. — match your government-issued ID", // copy-audit-disable
      phoneLabel: "Phone number",
      phonePlaceholder: "+234 801 234 5678", // copy-audit-disable
      regionLabel: "Region",
      regionPlaceholder: "e.g. Lagos Island, Abuja FCT, Accra Central", // copy-audit-disable
      accreditationLabel: "Accreditation number",
      accreditationPlaceholder: "DOC-AG-2024-XXXXXX", // copy-audit-disable
      saveLabel: "Save profile",
      savingLabel: "Saving\u2026",
      savedLabel: "Profile saved successfully.",
    },

    notifications: {
      sectionTitle: "Notification preferences",
      sectionDescription: "Choose which events you want to be notified about.",
      newStudent: "New student assigned",
      newStudentDescription: "When a student joins using your referral link.",
      commissionPaid: "Commission paid",
      commissionPaidDescription: "When a payout is processed to your account.",
      studentMilestone: "Student milestone",
      studentMilestoneDescription:
        "When a student completes KYC, submits documents, or receives a certificate.",
      accountSecurity: "Account and security alerts",
      accountSecurityDescription:
        "Login from a new device or changes to your profile.",
      saveLabel: "Save preferences",
      savingLabel: "Saving\u2026",
      savedLabel: "Preferences saved.",
    },

    sessions: {
      sectionTitle: "Active sessions",
    },

    validation: {
      fullNameRequired: "Full name is required.",
      fullNameMax: "Full name must be 120 characters or fewer.",
      phoneInvalid: "Enter a valid Nigerian phone number (+234XXXXXXXXXX).",
      accreditationRequired: "Accreditation number is required.",
    },

    errors: {
      profileSaveError: "Failed to save profile. Please try again.",
      notificationSaveError:
        "Failed to save notification preferences. Please try again.",
      loadError: "Could not load settings. Please refresh the page.",
      tryAgain: "Try again",
    },
  },

  students: {
    title: 'Your students',
    subtitle: 'Track every student you manage through their funding journey.',
    table: {
      email: 'Email',
      school: 'School',
      program: 'Program',
      kycStatus: 'KYC',
      documents: 'Docs',
      assignedAt: 'Assigned',
    },
    kycLabels: {
      not_started: 'Not started',
      pending: 'Pending',
      verified: 'Verified',
      failed: 'Failed',
    },
    empty: {
      title: 'No students assigned',
      description: 'Share your referral link to onboard your first student.',
    },
    error: {
      title: 'Failed to load students',
      description: 'Please refresh the page to try again.',
    },
  },

  activity: {
    title: 'Activity',
    subtitle: 'Recent events from your students and commission updates.',
    empty: {
      title: 'No activity yet',
      description: 'Student events and commission updates will appear here.',
    },
    error: {
      title: 'Failed to load activity',
      description: 'Please refresh the page to try again.',
    },
    commissionLabel: 'Commission update',
    studentLabel: 'Student assignment',
    dateLabel: 'Date',
  },

  actions: {
    title: 'Quick actions',
    subtitle: 'Shortcuts to common operations.',
    invite: {
      heading: 'Invite a student',
      description: 'Share your referral link with prospective students. They sign up, you earn commissions when they verify.',
      copyLinkLabel: 'Your referral link',
      copyLinkCta: 'Copy link',
      copied: 'Copied!',
      linkPlaceholder: 'Your referral link is on its way…',
    },
    comingSoon: {
      heading: 'Bulk tools & advanced operations',
      description: 'Bulk operations and advanced tools will be available here as your portfolio grows.',
    },
  },

  nav: {
    dashboard: "Dashboard",
    commissions: "Commissions",
    referral: "Referral",
    students: "Students",
    settings: "Settings",
  },

  errors: commonErrors,
} as const;

export type AgentCopy = typeof agentCopy;
