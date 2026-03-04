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

  settings: {
    title: "Sponsor settings",
    subtitle:
      "Manage your profile, security preferences, and notification controls for Doculet verification updates.",
    profile: {
      title: "Profile details",
      description:
        "Keep your sponsor identity accurate so universities can trust every certificate linked to your account.",
      fullNameLabel: "Full name",
      fullNamePlaceholder: "Enter your full name",
      emailLabel: "Email address",
      emailPlaceholder: "you@example.com",
      phoneLabel: "Phone number",
      phonePlaceholder: "+2348012345678",
      phoneHint: "Use Nigerian format with +234 prefix.",
      relationshipLabel: "Relationship to student",
      relationshipPlaceholder: "Select relationship",
      relationshipOptions: {
        parent: "Parent",
        guardian: "Guardian",
        relative: "Relative",
        corporate: "Corporate sponsor",
        other: "Other",
      },
      sponsorTypeLabel: "Sponsor type",
      sponsorTypeDescription:
        "Choose the account type used to support students on Doculet.",
      sponsorTypeOptions: {
        individual: {
          label: "Individual",
          description: "Sponsor as a parent, guardian, or family member.",
        },
        corporate: {
          label: "Corporate",
          description: "Sponsor through a registered company or organisation.",
        },
      },
      corporateSectionTitle: "Corporate sponsor details",
      corporateSectionDescription:
        "Corporate sponsors must provide legal registration and director identity details.",
      companyNameLabel: "Company name",
      companyNamePlaceholder: "Enter registered company name",
      cacNumberLabel: "CAC number",
      cacNumberPlaceholder: "Enter CAC registration number",
      directorBvnLabel: "Director BVN",
      directorBvnPlaceholder: "11-digit BVN",
      submitLabel: "Save profile",
      submittingLabel: "Saving profile...",
      successMessage: "Profile updated successfully.",
      errorMessage: "We could not update your profile. Please try again.",
    },
    notifications: {
      title: "Notification preferences",
      description: "Control which sponsor updates are sent to your email.",
      emailSectionTitle: "Email notifications",
      emailSectionDescription:
        "Choose the updates that matter most to your sponsorship activity.",
      fundingUpdatesLabel: "Funding updates",
      fundingUpdatesDescription:
        "Receive updates when disbursement schedules or funding commitments change.",
      verificationUpdatesLabel: "Verification progress",
      verificationUpdatesDescription:
        "Get notified when student or sponsor verification status changes.",
      securityAlertsLabel: "Security alerts",
      securityAlertsDescription:
        "Get alerts for suspicious login activity and sensitive account changes.",
      submitLabel: "Save preferences",
      submittingLabel: "Saving preferences...",
      successMessage: "Notification preferences updated.",
      errorMessage: "Unable to save your notification preferences.",
    },
    sessions: {
      title: "Session security",
      description:
        "Review devices currently signed in to your account and confirm last login location.",
      lastLoginLabel: "Last login location",
      noLastLoginFallback: "Location unavailable",
      safeStatusTitle: "No suspicious sign-ins detected",
      safeStatusDescription:
        "Your account activity looks normal. We will alert you if unusual access is detected.",
      alertStatusTitle: "Suspicious sign-in detected",
      alertStatusDescription:
        "We detected a login from an unverified location. Revoke unknown sessions immediately.",
      revokeAllLabel: "Sign out all other sessions",
    },
    states: {
      loadingTitle: "Loading sponsor settings",
      loadingDescription:
        "Fetching your profile, preferences, and session security details.",
      errorTitle: "Unable to load settings",
      errorDescription:
        "Please retry. If this persists, sign out and sign back in to refresh your session.",
      retryLabel: "Retry",
      emptyTitle: "No profile details yet",
      emptyDescription:
        "Add your sponsor details to complete account setup and verification readiness.",
      restoreDefaultsLabel: "Load defaults",
    },
    validation: {
      invalidEmail: "Enter a valid email address.",
      invalidPhone: "Phone number must be in +234XXXXXXXXXX format.",
      invalidBvn: "Director BVN must contain exactly 11 digits.",
      nameMin: "Full name must contain at least 2 characters.",
      nameMax: "Full name cannot exceed 120 characters.",
      companyNameMax: "Company name cannot exceed 120 characters.",
      cacNumberMax: "CAC number cannot exceed 50 characters.",
      companyNameRequired: "Company name is required for corporate sponsors.",
      cacNumberRequired: "CAC number is required for corporate sponsors.",
      directorBvnRequired: "Director BVN is required for corporate sponsors.",
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
