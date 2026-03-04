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
    title: "Sponsor verification",
    subtitle:
      "Complete identity, source-of-funds, and bank verification to issue a trusted Doculet certificate.",
    tiers: [
      {
        label: "Tier 1",
        description: "Identity verification complete.",
      },
      {
        label: "Tier 2",
        description: "Identity, source-of-funds, and bank verification complete.",
      },
      {
        label: "Tier 3",
        description: "Corporate checks (if required) and admin review complete.",
      },
    ],
    status: {
      draft: "Draft",
      submitted: "Submitted",
      underReview: "Under review",
      approved: "Approved",
      certificateIssued: "Certificate issued",
      rejected: "Rejected",
      actionRequired: "Action required",
      expired: "Expired",
    },
    stepLabels: {
      identity: "Identity verification",
      sourceOfFunds: "Source of funds",
      bankVerification: "Bank verification",
      corporateChecks: "Corporate sponsor checks",
      adminReview: "Admin review",
    },
    tierBadges: {
      tier1: "Tier 1",
      tier2: "Tier 2",
      tier3: "Tier 3",
    },
    page: {
      heading: "Sponsor KYC verification",
      body: "US universities rely on this verification to trust proof-of-funds from Nigerian accounts.",
      kycStatusLabel: "Current KYC status",
      timezoneLabel: "Timezone",
      timezoneValue: "WAT (Africa/Lagos)",
      refreshLabel: "Refresh status",
      refreshedLabel: "Status refreshed",
    },
    identity: {
      title: "1. Identity verification",
      description:
        "Choose one method now. Both NIN and passport options are available from the start.",
      methodLabel: "Verification method",
      methodNin: "Use NIN",
      methodPassport: "Use passport",
      ninLabel: "NIN (11 digits)",
      ninPlaceholder: "12345678901",
      passportLabel: "Passport number",
      passportPlaceholder: "A12345678",
      submitLabel: "Submit identity details",
      savingLabel: "Submitting identity details",
    },
    sourceOfFunds: {
      title: "2. Source of funds declaration",
      description:
        "Declare funding source and the amount available for education sponsorship.",
      sponsorTypeLabel: "Sponsor type",
      sponsorTypeIndividual: "Individual sponsor",
      sponsorTypeCorporate: "Corporate sponsor",
      sponsorTypeSelf: "Self-sponsored organization",
      sourceLabel: "Source category",
      sourcePlaceholder: "Select source category",
      sourceSalary: "Salary",
      sourceBusiness: "Business income",
      sourceSavings: "Savings",
      sourceInvestment: "Investments",
      amountLabel: "Available amount (₦)",
      amountPlaceholder: "5000000",
      corporateBlockTitle: "Corporate sponsor requirements",
      corporateBlockDescription:
        "Corporate sponsors must provide CAC registration, director BVN, and sponsorship letter.",
      cacLabel: "CAC registration number",
      cacPlaceholder: "RC1234567",
      directorBvnLabel: "Director BVN (11 digits)",
      directorBvnPlaceholder: "12345678901",
      letterLabel: "Official sponsorship letter",
      submitLabel: "Save source of funds",
      savingLabel: "Saving source details",
    },
    bank: {
      title: "3. Bank account verification",
      description:
        "PDF upload and Mono live connection are both primary verification paths.",
      pdfTitle: "Verify with bank statement PDF",
      pdfDescription:
        "Upload the official PDF statement downloaded from your Nigerian bank portal.",
      pdfFileLabel: "Bank statement PDF",
      pdfSubmitLabel: "Submit PDF statement",
      pdfSubmittingLabel: "Submitting statement",
      monoTitle: "Verify with Mono live connection",
      monoDescription:
        "Connect your account in real time. If Mono fails, we automatically guide you to PDF upload.",
      monoAccountIdLabel: "Mono account reference",
      monoAccountIdPlaceholder: "mono_account_reference",
      bankNameLabel: "Bank name",
      bankNamePlaceholder: "Guaranty Trust Bank",
      accountNumberLabel: "Account number",
      accountNumberPlaceholder: "0123456789",
      monoSubmitLabel: "Connect with Mono",
      monoSubmittingLabel: "Connecting bank account",
      monoFailedTitle: "Mono connection failed",
      monoFailedBody:
        "Use the PDF upload path now to complete verification without delay.",
      monoConnectedTitle: "Mono account connected",
      monoConnectedBody:
        "Bank verification is in progress. You can still upload PDF for additional evidence.",
    },
    security: {
      title: "Session security",
      description:
        "Monitor sign-in activity while completing KYC. Report suspicious activity immediately.",
      lastLoginLocationLabel: "Last login location",
      lastLoginDeviceLabel: "Last login device",
      activeSessionsLabel: "Active sessions",
      suspiciousAlertsLabel: "Suspicious alerts",
      unavailableValue: "Unavailable",
    },
    validation: {
      requiredSelection: "Select one option to continue.",
      ninInvalid: "Enter a valid 11-digit NIN.",
      passportRequired: "Enter your passport number.",
      sourceRequired: "Select source of funds.",
      amountRequired: "Enter an amount greater than zero.",
      accountNumberInvalid: "Enter a valid 10-digit account number.",
      fileRequired: "Select a file before submitting.",
      cacRequired: "Enter CAC registration number.",
      directorBvnInvalid: "Enter a valid 11-digit director BVN.",
      letterRequired: "Upload the official sponsorship letter.",
      bankNameRequired: "Enter your bank name.",
      monoReferenceRequired: "Enter Mono account reference.",
    },
    empty: {
      title: "No verification profile found",
      description: "Start with identity verification to initialize your sponsor KYC profile.",
    },
    error: {
      title: "Unable to load sponsor KYC",
      description: "Refresh this page and try again.",
      retryLabel: "Try again",
    },
    loading: {
      title: "Loading sponsor KYC",
      description: "Fetching verification progress, tier status, and trust checks.",
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
