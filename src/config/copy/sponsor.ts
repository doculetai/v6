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

  students: {
    title: "Students you sponsor",
    subtitle:
      "Track each student's funding progress, tier readiness, and linked sponsorship status.",
    currencySymbol: "₦",
    countLabel: (count: number) => `${count} ${count === 1 ? "student" : "students"} linked`,
    addStudentCta: "Invite a student",
    inviteFlow: {
      title: "Invite a student",
      description:
        "Send a sponsor invitation to a student by email. Once they accept, this funding link moves to active tracking.",
      emailLabel: "Student email",
      emailPlaceholder: "student@example.com",
      amountLabel: "Funding amount (₦)",
      amountPlaceholder: "e.g. 7,500,000",
      submitCta: "Send invitation",
      cancelCta: "Cancel",
      successLabel: "Invitation sent and student link created.",
      validation: {
        invalidEmail: "Enter a valid student email address.",
        invalidAmount: "Enter a funding amount greater than zero.",
      },
      errors: {
        notFound:
          "We could not find a student account for that email. Ask the student to create their Doculet profile first.",
        delivery:
          "The student link was created, but we could not deliver the invitation email right now.",
        generic: "We could not send this invitation right now. Please try again.",
      },
    },
    card: {
      universityLabel: "University",
      programLabel: "Program",
      fundingLabel: "Funding amount",
      updatedLabel: "Last updated (WAT)",
      removeCta: "Remove link",
      removePendingLabel: "Removing...",
    },
    tier: {
      label: "Tier",
      tier1: "Tier 1",
      tier2: "Tier 2",
      tier3: "Tier 3",
    },
    status: {
      pending: "Pending",
      active: "Active",
      completed: "Completed",
    },
    empty: {
      title: "No students linked yet",
      description:
        "Invite your first student to start tracking their verification and funding progress in one place.",
      cta: "Invite a student",
    },
    loading: {
      ariaLabel: "Loading sponsored students",
    },
    error: {
      title: "We could not load your students",
      description:
        "Your sponsorship data is still safe. Please retry in a moment to continue tracking students.",
      retryCta: "Try again",
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
    empty: {
      title: "No disbursements yet",
      description:
        "Your disbursement history will appear here once you commit funds to a student.",
    },
    table: {
      student: "Student",
      amount: "Amount (₦)",
      date: "Date",
      status: "Status",
      reference: "Reference",
    },
    statusLabels: {
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      failed: "Failed",
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
