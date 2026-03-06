export const studentOnboardingCopy = {
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
        schoolPlaceholder: "Type to find your university", // copy-audit-disable
        schoolHint: "Search for your university",
        programLabel: "Program",
        programPlaceholder: "Search your degree program", // copy-audit-disable
        programHint: "Choose your degree program",
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
        nextStepCta: "Begin your verification",
        overviewCta: "Go to your overview",
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
} as const;
