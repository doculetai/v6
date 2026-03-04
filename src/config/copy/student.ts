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
    title: "Your certificate",
    subtitle:
      "Your tamper-evident proof of funds, ready to share with universities and embassies.",
    checklist: [
      { label: "Identity verified" },
      { label: "School selected" },
      { label: "Bank account connected" },
      { label: "Documents uploaded" },
      { label: "Sponsor committed" },
    ],
    certificate: {
      title: "Proof of funds certificate",
      shareCta: "Share certificate",
      downloadCta: "Download PDF",
    },
    locked: {
      title: "Certificate not ready yet",
      description:
        "Complete all checklist items above to unlock your proof of funds certificate.",
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
