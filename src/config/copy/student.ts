import { commonErrors } from "./shared";
import { studentOnboardingCopy } from "./student-onboarding.copy";

export const studentCopy = {
  ...studentOnboardingCopy,

  schools: {
    title: "Find your school",
    subtitle: "Search universities across the United States and Nigeria. Select a program to set your funding target.",
    searchHint: "Search by university, city, or state…",
    empty: {
      title: "No programs found",
      description: "Try a different search term or broaden your filters.",
      cta: "Clear filters",
    },
    card: {
      apply: "Apply",
      viewDetails: "View details",
      visitWebsite: "Visit website",
      estimatedTuition: "Estimated annual tuition (out-of-state)",
    },
    filters: {
      allCountries: "All countries",
      unitedStates: "United States",
      nigeria: "Nigeria",
      stateLabel: "State",
      statePlaceholder: "All states",
    },
    institutionTypes: {
      public: "Public",
      private_nonprofit: "Private non-profit",
      private_forprofit: "Private for-profit",
    },
    loadMore: "Show more schools",
  },

  verify: {
    title: "Verify your identity",
    subtitle: "Confirm your identity before your certificate is issued. All three tiers give you the strongest proof.",
    tracker: {
      title: "Verification progress",
      subtitle: "Track completion across Tier 1, Tier 2, and Tier 3 before certificate release.",
      completionLabel: "Completion",
      lastUpdatedLabel: "Last update",
    },
    status: {
      not_started: "Not started",
      pending: "Pending",
      verified: "Verified",
      failed: "Failed",
    },
    kycSection: {
      title: "Identity verification",
      tiers: [
        {
          label: "Starter",
          description: "Confirm your email and phone number to unlock basic features.",
        },
        {
          label: "Verified",
          description: "Submit your BVN or NIN for standard access, document uploads, and sponsor invitations.",
        },
        {
          label: "Enhanced",
          description: "Upload your passport and complete a selfie check to unlock certificate generation.",
        },
      ],
      dojahForm: {
        title: "Verify your identity",
        description: "Enter your BVN, NIN, or passport number to complete a secure identity check.",
        tierLabel: "Tier",
        identityTypeLabel: "Identity type",
        identityNumberLabel: "Identity number",
        submitCta: "Start identity check",
        pendingReferenceLabel: "Verification reference",
        tierOptions: {
          tier2: "Tier 2",
          tier3: "Tier 3",
        },
      },
      identityTypes: {
        bvn: "BVN",
        nin: "NIN",
        passport: "Passport",
      },
    },
    kycFailure: {
      firstAttempt: "Verification did not match. Try entering your name exactly as it appears on your BVN registration.",
      secondAttempt: "Automated verification was unsuccessful. You can upload your government-issued ID and a selfie for manual review.",
      manualReviewTitle: "Upload ID for manual review",
      manualReviewDescription: "Upload a clear photo of your government-issued ID (passport, driver's licence, or national ID card) and a selfie holding the ID.",
      governmentIdLabel: "Government-issued ID",
      selfieLabel: "Selfie holding your ID",
      fileTooLarge: "File must be 8MB or less.",
      governmentIdPlaceholder: "Click to select your government ID",
      selfiePlaceholder: "Click to take or select a selfie",
      uploadError: "Unable to upload files. Please try again.",
      submitCta: "Submit for manual review",
      submittingCta: "Submitting...",
      submittedFeedback: "Your documents have been submitted for manual review. We will update your verification status within 24-48 hours.",
      submittedTitle: "Manual review in progress",
      submittedDescription: "Our team is reviewing your uploaded ID. You will be notified when the review is complete.",
    },
    bankExpiringBanner: "Your bank connection is about to expire. Reconnect to keep your balance verified.",
    bankSection: {
      title: "Connect your bank",
      description:
        "Link your account securely for real-time balance verification. Your login credentials are never stored by Doculet.",
      connectCta: "Connect bank account",
      monoForm: {
        monoAccountIdLabel: "Mono account ID",
        bankNameLabel: "Bank name",
        accountNumberLabel: "Account number",
        submitCta: "Save Mono connection",
      },
      connectedLabel: "Connected account",
      uploadAlternativeCta: "Upload a bank statement instead",
      orDivider: "or",
      connectMonoCta: "Connect your bank account",
      manualForm: {
        title: "Add bank account manually",
        description: "For banks not supported by Mono, or accounts outside Nigeria.",
        bankNameLabel: "Bank name",
        accountNumberLabel: "Account number (NUBAN or IBAN)",
        currencyLabel: "Account currency",
        accountTypeLabel: "Account type",
        countryLabel: "Country code (e.g. NG, GB, US)",
        submitCta: "Add account",
        successToast: "Bank account added. Upload a statement to complete verification.",
      },
      accountsList: {
        title: "Your bank accounts",
        empty: "No bank accounts linked yet.",
        monoVerified: "Verified via Mono",
        manualUpload: "Manually added",
        removeCta: "Remove",
        removeConfirmTitle: "Remove this bank account?",
        removeConfirmDescription: "This action cannot be undone. You may need to re-link this account later.",
        removeConfirmCta: "Remove account",
        removeCancel: "Cancel",
        removeSuccess: "Bank account removed.",
      },
    },
    actions: {
      refresh: "Refresh status",
    },
    feedback: {
      dojahStarted: "Identity check started. We'll update your status once the check completes.",
      monoConnected: "Mono connection saved. Tier tracker has been updated.",
      manualAdded: "Bank account added. Upload a bank statement to complete verification.",
      loadError: "Unable to load verification status right now.",
      dojahError: "Unable to start identity verification. Please try again.",
      monoError: "Unable to save your Mono account right now.",
    },
  },

  documents: {
    title: "Your documents",
    subtitle: "Upload supporting evidence to strengthen your proof of funds.",
    uploadCta: "Upload document",
    typeOptions: [
      { value: "passport", label: "International passport" },
      { value: "bank_statement", label: "Bank statement" },
      { value: "offer_letter", label: "Offer / admission letter" },
      { value: "affidavit", label: "Affidavit of support" },
      { value: "cac", label: "CAC registration document" },
    ],
    types: {
      passport: "International passport",
      bankStatement: "Bank statement",
      offerLetter: "Offer / admission letter",
      affidavit: "Affidavit of support",
    },
    status: {
      pending: "Under review",
      approved: "Approved",
      rejected: "Rejected",
      moreInfoRequested: "More information needed",
      expired: "Expired",
    },
    upload: {
      title: "Upload a new document",
      description: "Accepted formats: PDF, PNG, or JPG. Maximum size: 8MB.",
      documentTypeLabel: "Document type",
      documentTypeHint: "Choose the document type",
      fileLabel: "Document file",
      fileHelp: "Your file is encrypted in transit and reviewed by the Doculet verification team.",
      selectedFileLabel: "Selected file",
      fileAccept: "application/pdf,image/png,image/jpeg",
      submitIdle: "Upload document",
      submitUploading: "Uploading document...",
    },
    reuploadCta: "Re-upload",
    list: {
      title: "Submitted documents",
      description: "Track review decisions and provide updates quickly when feedback is requested.",
      ariaLabel: "Submitted document list",
      submittedAtLabel: "Submitted",
      rejectionReasonLabel: "Rejection reason",
      rejectionReasonFallback: "No rejection reason has been provided yet.",
      viewCta: "View",
    },
    states: {
      loadingTitle: "Loading your documents",
      loadingDescription: "Pulling your latest verification status.",
      errorTitle: "Unable to load documents",
      errorDescription: "Please try again. If this keeps happening, contact support.",
      retryCta: "Retry",
      emptyTitle: "No documents yet",
      emptyDescription:
        "Upload your admission letter, bank statement, or other supporting documents to strengthen your proof.",
    },
    validation: {
      documentTypeRequired: "Please select a document type.",
      fileRequired: "Please choose a file before uploading.",
      fileTypeInvalid: "Upload a PDF, PNG, or JPG file.",
      fileTooLarge: "File size must be 8MB or less.",
      uploadFailed: "We could not upload your document right now. Please try again.",
    },
    empty: {
      title: "No documents yet",
      description:
        "Upload your admission letter, bank statement, or other supporting documents to strengthen your proof.",
    },
    allApproved: {
      heading: "All documents approved",
      body: "Your supporting documents have been verified. Your proof of funds is ready to review.",
      cta: "View your proof status",
    },
  },

  proof: {
    title: "Proof certificate",
    subtitle: "Track the four trust checks that unlock your tamper-evident certificate.",
    progress: {
      title: "Verification checklist",
      description: "Your certificate issues when all four checks are complete.",
      progressLabel: "{completed} of {total} complete",
      completeBadge: "Complete",
      pendingBadge: "Pending",
      items: {
        school: {
          label: "School and program",
          completeDetail: "School and program selected.",
          pendingDetail: "Select your school and program in onboarding.",
        },
        kyc: {
          label: "KYC verification",
          completeDetail: "Identity verified with Doculet.",
          pendingDetail: "Finish KYC verification to unlock certificate issuance.",
        },
        bank: {
          label: "Bank account verification",
          completeDetail: "Bank account linked and verified.",
          pendingDetail: "Link and verify your bank account.",
        },
        sponsor: {
          label: "Sponsor commitment",
          completeDetail: "Sponsor has an active commitment.",
          pendingDetail: "Invite and activate at least one sponsor.",
        },
        documents: {
          label: "Supporting documents",
          completeDetail: "At least one document has been approved.",
          pendingDetail: "Upload documents and wait for approval.",
        },
      },
    },
    certificate: {
      title: "Tamper-evident certificate",
      description:
        "Your certificate is cryptographically signed and verifiable by any embassy or institution worldwide.",
      issuedBadge: "Issued",
      lockedBadge: "Locked",
      idLabel: "Certificate ID",
      issuedAtLabel: "Issued at",
      shareLinkLabel: "Secure share link",
      noShareLink: "No share link generated yet.",
      generateShareCta: "Generate secure share link",
      regenerateShareCta: "Regenerate secure share link",
      generatingCta: "Generating secure link...",
      copyLinkCta: "Copy link",
      copiedLinkCta: "Copied",
      trustTitle: "Trust signals",
      unavailableValue: "Unavailable",
      trust: {
        sponsorCountLabel: "Verified sponsors",
        committedAmountLabel: "Committed amount",
        approvedDocumentsLabel: "Approved documents",
        pendingDocumentsLabel: "Pending documents",
        lastAuditLabel: "Last audit update",
      },
    },
    embassyRequirements: {
      title: "Embassy requirements",
      description: "Based on your school's country, here is what the embassy expects.",
      minFundsLabel: "Minimum funds",
      minBalanceDaysLabel: "Minimum holding period",
      requiredDocsLabel: "Required documents",
      notesLabel: "Important notes",
      daysUnit: "consecutive days",
      noMinimum: "No fixed minimum (varies by program)",
      noHoldingPeriod: "No minimum holding period required",
      notAvailable: "Embassy requirements for this country are not yet available. Contact support for guidance.",
    },
    locked: {
      title: "Certificate not ready yet",
      description:
        "Complete KYC, bank, sponsor, and document checks to unlock your proof certificate.",
      helper: "Complete all four checklist items to unlock secure sharing.",
    },
    empty: {
      title: "Start your proof checklist",
      description:
        "Complete identity verification, link your bank account, and invite a sponsor to unlock your certificate.",
      cta: "Continue verification",
      illustrationLabel: "Shield and document checklist illustration",
    },
    states: {
      loadingTitle: "Loading proof certificate",
      loadingDescription: "Fetching your latest verification and audit records.",
      errorTitle: "We could not load this certificate view",
      errorDescription: "Please refresh in a moment to try again.",
      shareError: "Unable to generate a secure share link right now. Please try again.",
      retryCta: "Try again",
      shareWithUniversity: {
        heading: "Share with your university",
        body: "Your certificate is ready. Send the secure link to your admissions office to confirm your proof of funds.",
        cta: "Copy share link",
      },
    },
  },

  sponsorInvite: {
    title: "Invite a sponsor",
    subtitle:
      "A sponsor commits funds toward your education. They'll complete a brief verification before their funds count toward your proof.",
    inviteByEmail: {
      label: "Sponsor's email address",
      inputHint: "Enter your sponsor's email address",
      sendCta: "Send invitation",
    },
    status: {
      pending: "Invitation sent — awaiting response",
      accepted: "Accepted — sponsor completing verification",
      declined: "Invitation declined",
      cancelled: "Invitation cancelled",
    },
    cancel: "Cancel invitation",
  },

  nextSteps: {
    postOnboarding: {
      title: "Great start",
      body: "You have completed onboarding. Next, verify your identity to move closer to your proof certificate.",
      cta: "Start verification",
      href: "/dashboard/student/verify",
    },
    postKyc: {
      title: "Identity verified",
      body: "Your identity is confirmed. Connect your bank account so we can verify your funds.",
      cta: "Connect bank",
      href: "/dashboard/student/verify",
    },
    postBank: {
      title: "Bank connected",
      body: "Your bank account is linked. Upload your supporting documents next.",
      cta: "Upload documents",
      href: "/dashboard/student/documents",
    },
    postDocs: {
      title: "Documents verified",
      body: "All documents approved. Invite a sponsor or check your proof certificate status.",
      cta: "View proof status",
      href: "/dashboard/student/proof",
    },
    postSponsor: {
      title: "Sponsor confirmed",
      body: "Your sponsor has committed funds. Your proof certificate is being prepared.",
      cta: "View certificate",
      href: "/dashboard/student/proof",
    },
    postCertificate: {
      title: "Certificate issued",
      body: "Your proof-of-funds certificate is ready. Download or share it with your university.",
      cta: "View certificate",
      href: "/dashboard/student/proof",
    },
  },

  currency: {
    dualDisplayLabel: "NGN equivalent",
    coverageLabel: "Tuition coverage",
    coverageValue: "{percent}% covered",
    rateDisclaimer: "Exchange rate from {source} as of {date}. Rates are indicative.",
    bufferRecommendation: "We recommend holding 10-15% above the current NGN equivalent to account for rate fluctuation.",
    staleRateWarning: "Exchange rate data is more than 24 hours old. Amounts may differ from current market rates.",
  },

  settings: {
    title: "Account settings",
    subtitle: "Manage your sessions and account security.",
    editProfile: {
      title: "Personal information",
      description: "Update your name, phone number, and WhatsApp.",
      fullNameLabel: "Full name",
      phoneLabel: "Phone number",
      whatsappLabel: "WhatsApp number",
      saveCta: "Save changes",
      savingCta: "Saving...",
      successFeedback: "Profile updated.",
      errorFeedback: "Unable to update profile. Please try again.",
    },
    changePassword: {
      title: "Change password",
      description: "Update your password without leaving the dashboard.",
      currentLabel: "Current password",
      newLabel: "New password",
      confirmLabel: "Confirm new password",
      changeCta: "Change password",
      changingCta: "Changing...",
      successFeedback: "Password updated.",
      errorFeedback: "Unable to change password. Please try again.",
      mismatchError: "Passwords do not match.",
    },
    changeSchool: {
      title: "School and program",
      description: "Update your selected school and program.",
      changeCta: "Change school",
    },
    changeFunding: {
      title: "Funding type",
      description: "Change how your education is funded.",
      changeCta: "Change funding type",
    },
  },

  support: {
    title: "Support",
    subtitle: "Get help with your proof-of-funds journey.",
    empty: {
      title: "No tickets yet",
      description: "Create a support ticket and we'll respond within 24–48 hours.",
    },
    createCta: "Create ticket",
    form: {
      subjectLabel: "Subject",
      subjectPlaceholder: "Brief description of your issue",
      messageLabel: "Message",
      messagePlaceholder: "Describe your question or issue in detail…",
      submitCta: "Submit ticket",
      submittingCta: "Submitting…",
    },
    feedback: {
      success: "Ticket submitted. We'll respond within 24–48 hours.",
      error: "Unable to submit ticket. Please try again.",
    },
    ticket: {
      status: "Status",
      statusLabels: { open: "Open", in_progress: "In progress", resolved: "Resolved", closed: "Closed" },
      createdAt: "Submitted",
    },
  },

  nav: {
    overview: "Overview",
    schools: "Schools",
    verify: "Verify",
    documents: "Documents",
    proof: "Proof",
    invite: "Invite sponsor",
    breadcrumbs: {
      applicationSetup: "Application Setup",
      proofOfFunds: "Proof of Funds",
    },
  },

  errors: commonErrors,
} as const;

export type StudentCopy = typeof studentCopy;
