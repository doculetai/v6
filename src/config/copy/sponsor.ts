import { commonErrors } from "./shared";

export const sponsorCopy = {
  dashboard: {
    title: "Sponsor dashboard",
    subtitle: "Fund education with confidence. Every naira tracked.",
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
      amountPlaceholder: "e.g. 5,000,000",
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
    summary: {
      total: "Total disbursed",
      pending: "Pending transfers",
      completed: "Completed transfers",
      failed: "Failed transfers",
    },
    filters: {
      all: "All",
      pending: "Pending",
      completed: "Completed",
      failed: "Failed",
      queryPlaceholder: "Search by student or reference",
    },
    empty: {
      title: "No disbursements yet",
      description:
        "Your disbursement history will appear here once you commit funds to a student.",
    },
    form: {
      title: "New disbursement",
      description: "Transfer funds to a student's proof-of-funds account through Paystack.",
      fields: {
        student: "Student",
        amount: "Amount (₦)",
        note: "Note",
        schedule: "Schedule",
        scheduleNow: "Send immediately",
        scheduleLater: "Schedule for later",
        scheduleDateTime: "Disbursement date (WAT)",
      },
      placeholders: {
        student: "Select a student",
        amount: "e.g. 1,500,000",
        note: "Optional context for this transfer",
      },
      actions: {
        submit: "Create disbursement",
        submitting: "Initializing with Paystack...",
      },
      messages: {
        success: "Disbursement created successfully.",
        paystackMissing: "Paystack is not configured. Contact support.",
        paystackFailed: "Unable to initialize Paystack. Try again.",
      },
      validation: {
        studentRequired: "Select a student for this transfer.",
        amountRequired: "Enter a disbursement amount in naira.",
        amountInvalid: "Amount must be whole naira using digits and commas only.",
        amountTooLow: "Minimum disbursement is ₦1,000.",
        amountTooHigh: "Maximum disbursement is ₦500,000,000.",
        scheduleRequired: "Select a disbursement date and time.",
        scheduleInPast: "Scheduled disbursement must be in the future.",
        noteTooLong: "Note must be 160 characters or fewer.",
      },
    },
    table: {
      student: "Student",
      amount: "Amount (₦)",
      date: "Date",
      scheduledDate: "Scheduled date (WAT)",
      updatedDate: "Updated (WAT)",
      status: "Status",
      reference: "Reference",
      unavailable: "Not available",
    },
    statusLabels: {
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      failed: "Failed",
    },
    security: {
      title: "Transfer security",
      description:
        "Paystack references, transfer timestamps, and status updates are recorded for each disbursement.",
    },
    timeline: {
      title: "Recent status updates",
      empty: "Disbursement timeline updates will appear here.",
    },
    states: {
      loading: "Loading disbursements...",
      error: "Unable to load disbursements right now.",
      emptyStudents: "No eligible sponsored students are available for new disbursements yet.",
    },
    actions: {
      cancel: "Cancel",
      retry: "Retry",
      refresh: "Refresh",
    },
    downloadStatement: "Download statement",
    filterByStatus: "Filter by status",
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
