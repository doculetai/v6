export const studentOnboardingCopy = {
  onboarding: {
    title: "Your funding profile",
    subtitle: "Four steps to your verified proof-of-funds certificate.",
    steps: [
      {
        title: "Choose your school",
        description: "Select your university and program so we can set your funding target.",
      },
      {
        title: "Verify your identity",
        description: "Confirm your identity so embassies and universities can trust your certificate.",
      },
      {
        title: "Invite a sponsor",
        description: "Connect someone who is contributing to your education costs.",
      },
      {
        title: "Receive your certificate",
        description: "Your verified proof-of-funds certificate, ready to present to your university or embassy.",
      },
    ],
    cta: "Continue",
  },

  onboardingWizard: {
    badge: "Student profile",
    title: "Create your funding profile",
    subtitle:
      "Confirm your school, identity, and funding details so we can issue your certificate.",
    trustSignals: {
      secure: "Secure session",
      audit: "Audit-ready timeline",
      compliant: "Compliance checks enabled",
    },
    progress: {
      label: "Step",
      of: "of",
      ariaLabel: "Setup progress",
    },
    loading: {
      title: "Loading your profile",
      description: "Preparing schools, programs, and your saved progress.",
    },
    error: {
      title: "Unable to load your profile",
      description: "Please refresh to continue.",
      retryCta: "Try again",
    },
    empty: {
      title: "No schools available yet",
      description:
        "Partner institutions are being added. Please check back later.",
      cta: "Go to overview",
    },
    steps: {
      welcome: {
        title: "Welcome",
        description:
          "This creates your funding profile. Each step brings you closer to your verified certificate.",
        highlights: [
          "Your progress is saved automatically — continue any time.",
          "Every step is tracked on a secure, auditable timeline.",
          "A complete profile produces a stronger certificate.",
        ],
        cta: "Continue",
      },
      schoolProgram: {
        title: "School and program",
        description:
          "Select your institution and course so your funding target is accurate.",
        schoolLabel: "School",
        schoolPlaceholder: "Type to find your university", // copy-audit-disable
        schoolHint: "Search for your university",
        programLabel: "Program",
        programPlaceholder: "Search your degree program", // copy-audit-disable
        programHint: "Choose your degree program",
        programEmptyTitle: "No programs listed for this school",
        programEmptyDescription:
          "Try another institution while this school's program list is updated.",
        saveCta: "Save and continue",
        savingCta: "Saving...",
        errors: {
          schoolRequired: "Select a school to continue.",
          programRequired: "Select a program to continue.",
        },
      },
      fundingType: {
        title: "How is your education funded?",
        description:
          "Tell us who is paying so we verify the right accounts.",
        label: "Funding arrangement",
        options: {
          self: {
            title: "I am paying for my education",
            description: "Funds come from your own savings or personal bank account.",
          },
          sponsor: {
            title: "Someone is sponsoring me",
            description: "A parent, guardian, or someone close to you is contributing on your behalf.",
          },
          corporate: {
            title: "A company is sponsoring me",
            description: "An employer, scholarship body, or institution is covering your tuition.",
          },
        },
        saveCta: "Save and continue",
        savingCta: "Saving...",
        errors: {
          fundingRequired: "Select a funding arrangement to continue.",
        },
      },
      action: {
        title: "Confirm your details",
        description:
          "Review the information below, then confirm to activate your dashboard.",
        checklistTitle: "Summary",
        completeCta: "Confirm and continue",
        completingCta: "Confirming...",
        openDashboardCta: "Open your dashboard",
        successTitle: "Your profile is ready",
        nextStepCta: "Begin verification",
        overviewCta: "Go to your overview",
        successDescription:
          "Your funding profile is active. Continue to identity and funding verification.",
        summary: {
          school: "School",
          program: "Program",
          fundingType: "Funding",
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
    universityNotFound: {
      cta: "Can't find your university? Request to add it.",
      sheetTitle: 'Request a university',
      nameLabel: 'University name',
      countryLabel: 'Country',
      emailLabel: 'Contact email (optional)',
      submit: 'Submit request',
      submitting: 'Submitting\u2026',
      successNote: 'Request submitted. We will follow up within 3\u20135 business days.',
    },
    costBreakdown: {
      title: 'Programme costs',
      tuition: 'Tuition fee',
      processingFee: 'Proof of funds processing fee',
      total: 'Total required',
      currency: 'NGN',
    },
  },
} as const;
