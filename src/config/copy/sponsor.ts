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

  transactions: {
    title: "Transactions",
    subtitle:
      "View every Paystack charge, disbursement, and refund with audit-ready timestamps.",
    trustLabel: "Secure ledger",
    summary: {
      totalSpent: "Total spent",
      totalPending: "Total pending",
      lastUpdated: "Last updated",
    },
    filter: {
      searchPlaceholder: "Search by reference or transaction type",
      chips: {
        all: "All",
        credit: "Credit",
        debit: "Debit",
        fee: "Fee",
      },
    },
    table: {
      transaction: "Transaction",
      amount: "Amount",
      date: "Date",
      status: "Status",
      reference: "Reference",
    },
    types: {
      credit: "Credit",
      debit: "Debit",
      fee: "Fee",
      refund: "Refund",
    },
    statuses: {
      successful: "Successful",
      pending: "Pending",
      failed: "Failed",
      refunded: "Refunded",
    },
    sources: {
      disbursement: "Disbursement",
      paystackCharge: "Paystack charge",
      paystackFee: "Paystack fee",
      paystackRefund: "Paystack refund",
      paystackCredit: "Paystack credit",
    },
    empty: {
      title: "No matching transactions",
      description: "Try another filter or clear your search to see all transactions.",
    },
    loading: {
      title: "Loading transactions",
      description: "Fetching your latest ledger activity.",
    },
    error: {
      title: "Unable to load transactions",
      description:
        "We could not load your transaction history right now. Please try again.",
      retry: "Try again",
    },
    referenceFallback: "No reference",
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
