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
    },
    bankSection: {
      title: "Connect your bank",
      description:
        "Link your account via Mono for real-time balance verification. Your login credentials are never stored by Doculet.",
      connectCta: "Connect bank account",
    },
  },

  documents: {
    title: "Your documents",
    subtitle: "Upload supporting evidence to strengthen your proof of funds.",
    uploadCta: "Upload document",
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

  errors: {
    generic: "Something went wrong. Please try again.",
    sessionExpired: "Your session has expired. Please sign in again.",
    unauthorized: "You don't have permission to access this page.",
  },
} as const;

export type StudentCopy = typeof studentCopy;
