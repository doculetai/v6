import { commonErrors } from "./shared";

export const partnerCopy = {
  dashboard: {
    title: "Partner dashboard",
    subtitle: "Your platform, your brand. Powered by Doculet.",
    overview: {
      welcomeTitle: (name: string) => `Welcome back, ${name}`,
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
      apiResetSub: "Resets at midnight UTC",
      cta: "View students",
    },
    stats: {
      totalVerifications: "Total verifications",
      certificatesIssued: "Certificates issued",
      activeApiKeys: "Active API keys",
      apiCallsThisMonth: "API calls this month",
      apiCallsToday: "API calls today",
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

  programs: {
    title: 'Programs',
    subtitle: 'Browse available university programs and tuition requirements.',
    searchPlaceholder: 'Search by university name...',
    table: {
      university: 'University',
      program: 'Program',
      tuition: 'Tuition',
      duration: 'Duration',
      country: 'Country',
    },
    durationLabel: (months: number) =>
      months >= 12
        ? `${Math.floor(months / 12)} yr${Math.floor(months / 12) > 1 ? 's' : ''}${months % 12 ? ` ${months % 12} mo` : ''}`
        : `${months} mo`,
    empty: { title: 'No programs available', description: 'University programs will appear here once configured.' },
    error: {
      title: 'Failed to load programs',
      description: 'Please refresh the page to try again.',
    },
  },
  applications: {
    title: 'Applications',
    subtitle: 'Student applications submitted through your integration.',
    table: {
      student: 'Student',
      email: 'Email',
      status: 'Status',
      program: 'Program',
      submitted: 'Submitted',
    },
    statusLabels: {
      pending: 'Pending',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
    } as Record<string, string>,
    empty: { title: 'No applications yet', description: 'Student applications submitted through your API integration will appear here.' },
    error: {
      title: 'Failed to load applications',
      description: 'Please refresh the page to try again.',
    },
  },
  disbursements: {
    title: 'Disbursements',
    subtitle: 'Payment tracking.',
    empty: { title: 'No disbursements', description: 'Disbursement history will appear here.' },
  },
  compliance: {
    title: 'Compliance',
    subtitle: 'Verify your organisation meets platform requirements.',
    cards: {
      kyc: {
        title: 'KYC verification',
        description: 'Identity verification for your organisation.',
      },
      apiKeys: {
        title: 'API key configuration',
        description: 'At least one active API key is required.',
      },
      webhook: {
        title: 'Webhook configuration',
        description: 'Configure a webhook URL to receive verification events.',
      },
      documentation: {
        title: 'Organisation details',
        description: 'Organisation name and contact information on file.',
      },
    },
    statusLabels: {
      verified: 'Verified',
      configured: 'Configured',
      pending: 'Pending',
      actionNeeded: 'Action needed',
    },
    empty: { title: 'Compliance status unavailable', description: 'Could not load your compliance information.' },
    error: {
      title: 'Failed to load compliance',
      description: 'Please refresh the page to try again.',
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
        'students:read': "Students — read",
        'students:write': "Students — write",
        'certificates:read': "Certificates — read",
        'certificates:verify': "Certificates — verify",
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

  settings: {
    title: 'Settings',
    subtitle: 'Manage your partner organisation and integration preferences.',
    profile: {
      sectionTitle: 'Organisation profile',
      sectionDescription: 'Your organisation name and contact details visible on the platform.',
      orgNameLabel: 'Organisation name',
      orgNameHint: 'e.g. Meridian Capital Partners Ltd',
      webhookLabel: 'Webhook URL',
      webhookHint: 'https://api.yourcompany.com/webhooks/doculet',
      webhookDescription: 'Doculet will POST verification events to this URL.',
      saveLabel: 'Save changes',
      savingLabel: 'Saving…',
      savedLabel: 'Changes saved.',
    },
    validation: {
      orgNameMin: 'Organisation name must be at least 2 characters.',
      orgNameMax: 'Organisation name must be 120 characters or fewer.',
      webhookInvalid: 'Enter a valid HTTPS URL.',
    },
    errors: {
      loadError: 'Could not load settings. Please refresh the page.',
      saveError: 'Failed to save settings. Please try again.',
      tryAgain: 'Try again',
    },
  },

  apiLogs: {
    title: 'API request logs',
    subtitle: 'Detailed history of API requests made with your keys.',
    table: {
      method: 'Method',
      endpoint: 'Endpoint',
      status: 'Status',
      duration: 'Duration',
      environment: 'Environment',
      timestamp: 'Timestamp',
    },
    environmentLabels: {
      production: 'Production',
      sandbox: 'Sandbox',
    } as Record<string, string>,
    empty: {
      title: 'No API requests yet',
      description: 'API request history will appear here once you start making calls.',
    },
    error: {
      title: 'Failed to load logs',
      description: 'Please refresh the page to try again.',
    },
  },

  team: {
    title: 'Team',
    subtitle: 'Manage who has access to your partner dashboard.',
    table: {
      name: 'Name',
      email: 'Email',
      role: 'Role',
      added: 'Added',
      actions: 'Actions',
    },
    addMember: 'Add team member',
    addMemberDescription: 'Invite a colleague to access your partner dashboard.',
    form: {
      nameLabel: 'Full name',
      namePlaceholder: 'e.g. Tunde Okonkwo',
      emailLabel: 'Email address',
      emailPlaceholder: 'e.g. tunde@company.com',
      roleLabel: 'Role',
      submitLabel: 'Add member',
      submittingLabel: 'Adding\u2026',
    },
    roleLabels: {
      admin: 'Admin',
      developer: 'Developer',
      viewer: 'Viewer',
    } as Record<string, string>,
    removeConfirmTitle: 'Remove team member',
    removeConfirmDescription: 'Are you sure? This person will lose access immediately.',
    removeConfirmAction: 'Remove',
    removeCancel: 'Cancel',
    success: 'Team member added.',
    removeSuccess: 'Team member removed.',
    error: 'Failed to update team. Please try again.',
    empty: {
      title: 'No team members',
      description: 'Add colleagues to collaborate on your integration.',
    },
  },

  journey: {
    stages: {
      create_api_key: 'Create API key',
      configure_integration: 'Configure integration',
      enroll_students: 'Enrol students',
      monitor_throughput: 'Monitor throughput',
    },
    nextActions: {
      create_api_key: {
        label: 'Create your first API key',
        description: 'Generate an API key to start integrating with the Doculet platform.',
        cta: 'Manage API keys',
        href: '/dashboard/partner/api-keys',
      },
      configure_integration: {
        label: 'Configure your integration',
        description: 'Make your first API call to verify the integration is working.',
        cta: 'View API docs',
        href: '/dashboard/partner/api-keys',
      },
      enroll_students: {
        label: 'Enrol students via API',
        description: 'Use the API to submit student verification requests.',
        cta: 'View students',
        href: '/dashboard/partner/students',
      },
      monitor_throughput: {
        label: 'Monitor verification throughput',
        description: 'Track student verification rates and API performance.',
        cta: 'View analytics',
        href: '/dashboard/partner/analytics',
      },
    },
    completionMessage: 'Integration active. Students enrolling and verifying through your platform.',
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
