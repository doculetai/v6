import { commonErrors } from "./shared";

export const partnerCopy = {
  dashboard: {
    title: "Partner dashboard",
    subtitle: "Your platform, your brand. Powered by Doculet.",
    overview: {
      subtitle: (orgName: string | null) =>
        orgName
          ? `${orgName} — integration performance at a glance.`
          : "Monitor your integration performance.",
      stats: {
        totalStudents: { label: "Total Students", sub: "enrolled via your integration" },
        verifiedStudents: { label: "Verified Students", sub: "KYC complete" },
        activeApiKeys: { label: "Active API Keys", sub: "in use" },
      },
      summary: {
        withStudents: (verified: number, total: number) =>
          `${verified} of ${total} students have completed KYC verification.`,
        empty: "No students enrolled yet. Use the API Keys page to get your integration started.",
      },
      cta: "View students",
    },
    stats: {
      totalVerifications: "Total verifications",
      certificatesIssued: "Certificates issued",
      activeApiKeys: "Active API keys",
      apiCallsThisMonth: "API calls this month",
    },
    usage: {
      title: "API usage",
      empty: {
        title: "No API calls yet",
        description:
          "Your integration usage will appear here once you make your first API call.",
      },
      table: {
        endpoint: "Endpoint",
        calls: "Calls",
        successRate: "Success rate",
        avgLatency: "Avg. latency",
      },
    },
    recentActivity: {
      title: "Recent events",
      empty: {
        title: "No events yet",
        description: "Webhook events and API activity will appear here.",
      },
    },
    quickLinks: {
      title: "Quick links",
      docs: "API documentation",
      apiKeys: "Manage API keys",
      webhooks: "Configure webhooks",
      support: "Contact support",
    },
  },

  apiKeys: {
    title: "API keys",
    subtitle:
      "Create and manage API keys for your integration. Keep your secret keys secure — they are shown only once.",
    createKey: {
      cta: "Create new key",
      title: "Create API key",
      nameLabel: "Key name",
      nameHint: "e.g. Admissions integration — production",
      environmentLabel: "Environment",
      environments: {
        production: "Production",
        sandbox: "Sandbox",
      },
      scopesLabel: "Scopes",
      scopes: {
        verificationsRead: "Verifications — read",
        certificatesRead: "Certificates — read",
        webhooksWrite: "Webhooks — write",
        studentsRead: "Students — read",
      },
      confirmCta: "Create key",
      creatingCta: "Creating…",
      cancel: "Cancel",
    },
    newKeyCreated: {
      title: "API key created",
      description:
        "Copy your secret key now. For security reasons, it will not be shown again.",
      copyLabel: "Secret key",
      copyCta: "Copy secret key",
      copied: "Copied!",
      doneCta: "I've saved my key",
    },
    table: {
      name: "Name",
      environment: "Environment",
      lastUsed: "Last used",
      created: "Created",
      status: "Status",
      action: "Action",
    },
    statusLabels: {
      active: "Active",
      revoked: "Revoked",
    },
    actions: {
      revoke: "Revoke",
      revoking: "Revoking…",
      rotate: "Rotate",
    },
    revokeDialog: {
      title: "Revoke this key?",
      description:
        "Any integrations using this key will stop working immediately. This action cannot be undone.",
      confirmCta: "Revoke key",
      cancel: "Cancel",
    },
    empty: {
      title: "No API keys",
      description:
        "Create your first key to start integrating with the Doculet API.",
      cta: "Create your first key",
    },
  },

  branding: {
    title: "Branding",
    subtitle:
      "Customise your Doculet integration to match your institution's identity.",
    logoSection: {
      title: "Logo",
      description:
        "Your logo appears on the verification portal and on issued certificates.",
      uploadCta: "Upload logo",
      requirements: "SVG or PNG, max 2 MB, minimum 200 × 80 px",
      currentLabel: "Current logo",
      removeCta: "Remove logo",
    },
    colorSection: {
      title: "Brand colours",
      description: "Primary and accent colours used across your partner portal.",
      primaryLabel: "Primary colour",
      accentLabel: "Accent colour",
      resetCta: "Reset to defaults",
    },
    domainSection: {
      title: "Custom domain",
      description: "Host your verification portal on your own domain.",
      domainLabel: "Domain",
      domainHint: "verify.youruniversity.edu.ng",
      saveCta: "Save domain",
      status: {
        unverified: "Unverified",
        pending: "Pending DNS propagation",
        verified: "Verified",
        failed: "Verification failed",
      },
      instructions: "Add a CNAME record pointing to verify.doculet.ai",
    },
    previewSection: {
      title: "Preview",
      description:
        "See how your branding looks on the certificate verification page.",
    },
    saveCta: "Save branding",
    savingCta: "Saving…",
    saveSuccess: "Branding updated successfully.",
    error: {
      title: "Failed to load branding",
      description: "Please refresh the page to try again.",
    },
  },

  students: {
    title: "Students",
    subtitle: "Students verified through your API integration. Read-only.",
    table: {
      studentId: "Student ID",
      university: "University",
      tier: "Tier",
      verifiedDate: "Verified",
    },
    tierLabels: {
      1: "Tier 1",
      2: "Tier 2",
      3: "Tier 3",
    },
    tierDescriptions: {
      1: "Identity verified",
      2: "Bank linked",
      3: "Fully verified",
    },
    empty: {
      title: "No students yet",
      description:
        "Students verified through your API integration will appear here.",
    },
    error: {
      title: "Failed to load students",
      description:
        "There was a problem loading your student list. Please refresh the page.",
    },
  },

  analytics: {
    title: 'Analytics',
    subtitle: 'Integration performance and student verification metrics.',
    stats: {
      totalStudents: { label: 'Total students', sub: 'enrolled via your integration' },
      verifiedStudents: { label: 'Verified students', sub: 'KYC complete' },
      activeApiKeys: { label: 'Active API keys', sub: 'currently in use' },
    },
    error: {
      title: 'Failed to load analytics',
      description: 'Please refresh the page to try again.',
    },
  },

  nav: {
    dashboard: "Dashboard",
    apiKeys: "API keys",
    branding: "Branding",
    webhooks: "Webhooks",
    settings: "Settings",
  },

  errors: commonErrors,
} as const;

export type PartnerCopy = typeof partnerCopy;
