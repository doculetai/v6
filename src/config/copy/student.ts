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
