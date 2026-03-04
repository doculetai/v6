import { commonErrors } from "./shared";

export const studentCopy = {
  onboarding: {
    title: "Start your proof journey",
    subtitle: "Four steps to your proof-of-funds certificate — we'll guide you through each one.",
    steps: [
      {
        title: "Choose your school",
        description: "Find your university and program to set your funding target.",
      },
      {
        title: "Verify your identity",
        description: "Complete KYC so universities trust that your proof is genuine.",
      },
      {
        title: "Invite a sponsor",
        description: "Ask someone to commit funds toward your education costs.",
      },
      {
        title: "Get your certificate",
        description: "Receive your tamper-evident proof of funds, ready to share with anyone who needs it.",
      },
    ],
    cta: "Get started",
  },

  onboardingWizard: {
    badge: "Student onboarding",
    title: "Build your proof-of-funds profile",
    subtitle:
      "Complete four quick steps so Doculet can generate trusted funding records for your admission workflow.",
    trustSignals: {
      secure: "Secure session",
      audit: "Audit-ready timeline",
      compliant: "Compliance checks enabled",
    },
    progress: {
      label: "Step",
      of: "of",
      ariaLabel: "Onboarding progress",
    },
    loading: {
      title: "Loading your onboarding details",
      description: "Preparing schools, programs, and your saved progress.",
    },
    error: {
      title: "We could not load onboarding right now",
      description: "Refresh in a moment to continue your setup.",
      retryCta: "Try again",
    },
    empty: {
      title: "No schools are available yet",
      description:
        "Our admissions team is syncing partner institutions. Please check back shortly.",
      cta: "Go to overview",
    },
    steps: {
      welcome: {
        title: "Welcome",
        description:
          "This setup personalizes your funding journey and helps universities trust every data point.",
        highlights: [
          "Track your onboarding progress in one place.",
          "Save each step automatically and continue anytime.",
          "Generate a stronger certificate after completion.",
        ],
        cta: "Start onboarding",
      },
      schoolProgram: {
        title: "Select school and program",
        description:
          "Choose the exact institution and course so your funding target is accurate.",
        schoolLabel: "School",
        schoolPlaceholder: "Select a school",
        programLabel: "Program",
        programPlaceholder: "Select a program",
        programEmptyTitle: "No programs for this school yet",
        programEmptyDescription:
          "Try another school while we update this institution's program list.",
        saveCta: "Save school and program",
        savingCta: "Saving selection...",
        errors: {
          schoolRequired: "Select a school to continue.",
          programRequired: "Select a program to continue.",
        },
      },
      fundingType: {
        title: "Choose funding type",
        description:
          "Tell us how tuition will be covered so we can guide your next verification actions.",
        label: "Funding type",
        options: {
          self: {
            title: "Self funded",
            description: "You are paying tuition from your own verified funds.",
          },
          sponsor: {
            title: "Sponsor funded",
            description: "A sponsor will commit funds toward your tuition target.",
          },
          corporate: {
            title: "Corporate funded",
            description: "An employer or institution will provide sponsorship.",
          },
        },
        saveCta: "Save funding type",
        savingCta: "Saving funding type...",
        errors: {
          fundingRequired: "Select a funding type to continue.",
        },
      },
      action: {
        title: "Finalize onboarding",
        description:
          "Confirm your details and activate your student dashboard actions.",
        checklistTitle: "Review summary",
        completeCta: "Complete onboarding",
        completingCta: "Completing onboarding...",
        openDashboardCta: "Open student dashboard",
        successTitle: "Onboarding completed",
        successDescription:
          "Your profile is now ready. Continue to verification and funding actions.",
        summary: {
          school: "School",
          program: "Program",
          fundingType: "Funding type",
          tuition: "Tuition",
          duration: "Duration",
          monthsSuffix: "months",
          missingValue: "Not selected",
        },
      },
    },
    navigation: {
      backCta: "Back",
    },
  },

  schools: {
    title: "Find your school",
    subtitle: "Search thousands of programs. Select one to set your funding target.",
    searchPlaceholder: "Search schools, programs, or cities…",
    empty: {
      title: "No programs found",
      description: "Try a different search term or broaden your filters.",
      cta: "Clear filters",
    },
    card: {
      apply: "Apply",
      viewDetails: "View details",
    },
  },

  verify: {
    title: "Verify your identity",
    subtitle: "We confirm who you are before issuing your certificate. Complete all three tiers for the strongest proof.",
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
        title: "Run Dojah identity check",
        description: "Submit BVN, NIN, or passport details for secure identity verification via Dojah.",
        tierLabel: "Tier",
        identityTypeLabel: "Identity type",
        identityNumberLabel: "Identity number",
        submitCta: "Start Dojah check",
        pendingReferenceLabel: "Current Dojah reference",
      },
      identityTypes: {
        bvn: "BVN",
        nin: "NIN",
        passport: "Passport",
      },
    },
    bankSection: {
      title: "Connect your bank",
      description:
        "Link your account via Mono for real-time balance verification. Your login credentials are never stored by Doculet.",
      connectCta: "Connect bank account",
      monoForm: {
        monoAccountIdLabel: "Mono account ID",
        bankNameLabel: "Bank name",
        accountNumberLabel: "Account number",
        submitCta: "Save Mono connection",
      },
      connectedLabel: "Connected account",
    },
    actions: {
      refresh: "Refresh status",
    },
    feedback: {
      dojahStarted: "Dojah verification started. We will update your status after provider confirmation.",
      monoConnected: "Mono connection saved. Tier tracker has been updated.",
      loadError: "Unable to load verification status right now.",
      dojahError: "Unable to start the Dojah check. Please try again.",
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
    },
    upload: {
      title: "Upload a new document",
      description: "Accepted formats: PDF, PNG, or JPG. Maximum size: 8MB.",
      documentTypeLabel: "Document type",
      documentTypePlaceholder: "Select a document type",
      fileLabel: "Document file",
      fileHelp: "Your file is encrypted in transit and reviewed by the Doculet verification team.",
      selectedFileLabel: "Selected file",
      fileAccept: "application/pdf,image/png,image/jpeg",
      submitIdle: "Upload document",
      submitUploading: "Uploading document...",
    },
    list: {
      title: "Submitted documents",
      description: "Track review decisions and provide updates quickly when feedback is requested.",
      ariaLabel: "Submitted document list",
      submittedAtLabel: "Submitted",
      rejectionReasonLabel: "Rejection reason",
      rejectionReasonFallback: "No rejection reason has been provided yet.",
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
        kyc: {
          label: "KYC verification",
          completeDetail: "Identity verified with Doculet KYC.",
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
        "Each certificate link includes a signed token and immutable audit trail metadata.",
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
    locked: {
      title: "Certificate not ready yet",
      description:
        "Complete KYC, bank, sponsor, and document checks to unlock your proof certificate.",
      helper: "Secure sharing becomes available as soon as all checklist items are complete.",
    },
    empty: {
      title: "Start your proof checklist",
      description:
        "Your proof journey has not started yet. Begin verification to move toward certificate issuance.",
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
    },
  },

  sponsorInvite: {
    title: "Invite a sponsor",
    subtitle:
      "A sponsor commits funds toward your education. They'll complete a brief verification before their funds count toward your proof.",
    inviteByEmail: {
      label: "Sponsor's email address",
      placeholder: "sponsor@example.com",
      sendCta: "Send invitation",
    },
    status: {
      pending: "Invitation sent — awaiting response",
      accepted: "Accepted — sponsor completing verification",
      declined: "Invitation declined",
    },
    cancel: "Cancel invitation",
  },

  nav: {
    overview: "Overview",
    schools: "Schools",
    verify: "Verify",
    documents: "Documents",
    proof: "Proof",
    invite: "Invite sponsor",
  },

  errors: commonErrors,
} as const;

export type StudentCopy = typeof studentCopy;
