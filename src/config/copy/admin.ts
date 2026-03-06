import { commonErrors } from "./shared";

export const adminCopy = {
  dashboard: {
    title: "Admin dashboard",
    subtitle: "Platform health at a glance. Every action audited.",
    stats: {
      totalUsers: "Total users",
      activeStudents: "Active students",
      pendingDocuments: "Pending document reviews",
      certificatesIssued: "Certificates issued",
      revenueThisMonth: "Revenue this month (₦)",
      flaggedItems: "Flagged items",
    },
    recentActivity: {
      title: "Recent platform activity",
      empty: {
        title: "No recent activity",
        description:
          "Platform activity will appear here as users interact with the system.",
      },
    },
    systemHealth: {
      title: "System health",
      kycService: "KYC service (Dojah)",
      bankingService: "Banking service (Mono)",
      emailService: "Email service (Resend)",
      paymentService: "Payment service (Paystack)",
      status: {
        operational: "Operational",
        degraded: "Degraded",
        down: "Down",
      },
    },
    alerts: {
      title: "Active alerts",
      empty: "No active alerts",
      dismissAll: "Dismiss all",
    },
  },

  queue: {
    title: 'Review queue',
    subtitle: 'Prioritized items for review.',
    empty: { title: 'Queue is empty', description: 'Items will appear here when they need review.' },
  },
  documents: {
    title: 'Document browser',
    subtitle: 'Browse and search all documents.',
    empty: { title: 'No documents', description: 'Submitted documents will appear here.' },
  },
  statementReview: {
    title: 'Statement review',
    subtitle: 'Deep analysis of bank statements.',
    table: {
      student: 'Student',
      uploadDate: 'Uploaded',
      status: 'Status',
      action: 'Action',
    },
    statusLabels: {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      more_info_requested: 'More info needed',
      expired: 'Expired',
    },
    actions: {
      view: 'View',
    },
    pagination: {
      previous: 'Previous',
      next: 'Next',
      showing: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} of ${total}`,
    },
    empty: { title: 'No reviews', description: 'Statement reviews will appear here.' },
    error: { title: 'Failed to load statement reviews', description: 'Please refresh the page to try again.' },
  },
  fraud: {
    title: 'Fraud detection',
    subtitle: 'Flagged items and fraud signals.',
    empty: { title: 'No fraud flags', description: 'Flagged items will appear here.' },
  },
  payments: {
    title: 'Payments',
    subtitle: 'Payment and revenue tracking.',
    empty: { title: 'No payments', description: 'Payment records will appear here.' },
  },
  ledger: {
    title: 'Transactions ledger',
    subtitle: 'Money flow audit trail — disbursements, fees, refunds.',
    table: {
      type: 'Type',
      entity: 'Entity',
      amount: 'Amount',
      currency: 'Currency',
      date: 'Date',
    },
    filters: {
      type: 'Type',
      entityType: 'Entity type',
      dateFrom: 'From date',
      dateTo: 'To date',
      apply: 'Apply',
    },
    types: {
      disbursement: 'Disbursement',
      platform_fee: 'Platform fee',
      refund: 'Refund',
      reversal: 'Reversal',
      credit: 'Credit',
      debit: 'Debit',
    },
    empty: { title: 'No transactions', description: 'Transaction entries will appear here.' },
  },
  platformFees: {
    title: 'Platform fees',
    subtitle: 'Configure fee rules per currency (percentage or fixed).',
    table: {
      currency: 'Currency',
      feeType: 'Type',
      value: 'Value',
      effectiveFrom: 'Effective from',
      effectiveTo: 'End date',
      actions: 'Actions',
    },
    feeTypes: {
      percentage: 'Percentage',
      fixed: 'Fixed (kobo)',
    },
    add: 'Add fee rule',
    edit: 'Edit',
    end: 'End',
    endConfirmBody:
      'This will end the fee rule. It will no longer apply to new disbursements.',
    form: {
      currency: 'Currency',
      feeType: 'Type',
      valueKobo: 'Value (basis points for %, kobo for fixed)',
      effectiveFrom: 'Effective from',
      save: 'Save',
      cancel: 'Cancel',
    },
    empty: { title: 'No fee rules', description: 'Add a fee rule to deduct platform fees on disbursements.' },
  },
  audit: {
    title: 'Audit log',
    subtitle: 'Platform activity and audit trail.',
    table: {
      timestamp: 'Timestamp',
      action: 'Action',
      entityType: 'Entity type',
      actor: 'Actor',
      details: 'Details',
    },
    filters: {
      action: 'Filter by action',
      entityType: 'Filter by entity type',
      apply: 'Apply',
      clear: 'Clear',
    },
    pagination: {
      previous: 'Previous',
      next: 'Next',
      showing: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} of ${total}`,
    },
    empty: { title: 'No audit entries', description: 'Audit log entries will appear here.' },
    error: { title: 'Failed to load audit log', description: 'Please refresh the page to try again.' },
  },
  system: {
    title: 'System health',
    subtitle: 'Services and infrastructure status.',
    empty: { title: 'Loading', description: 'System status will appear here.' },
  },

  documentReview: {
    title: "Document review queue",
    subtitle: "Review and approve submitted documents. Every decision is logged.",
    filters: {
      status: "Status",
      documentType: "Type",
      dateRange: "Submitted",
      search: "Search by student…",
    },
    table: {
      student: "Student",
      documentType: "Type",
      submitted: "Submitted",
      status: "Status",
      reviewer: "Reviewer",
      action: "Action",
    },
    statusLabels: {
      pending: "Pending",
      inReview: "In review",
      approved: "Approved",
      rejected: "Rejected",
      moreInfoRequested: "More info needed",
    },
    actions: {
      review: "Review",
      approve: "Approve",
      reject: "Reject",
      requestInfo: "Request info",
      assignToMe: "Assign to me",
      exportLog: "Export audit log",
    },
    reviewDialog: {
      title: "Review document",
      documentType: "Document type",
      submittedBy: "Submitted by",
      submittedOn: "Submitted on",
      notesLabel: "Decision notes",
      notesHint: "Describe your decision clearly — the student will see this note.",
      approveCta: "Approve document",
      rejectCta: "Reject document",
      requestInfoCta: "Request more info",
      cancel: "Cancel",
    },
    empty: {
      title: "Queue empty",
      description: "All documents have been reviewed. Check back later.",
    },
    stats: {
      pending: "Pending",
      approvedToday: "Approved today",
      rejectedToday: "Rejected today",
      avgReviewTime: "Avg. review time",
    },
  },

  users: {
    title: "User management",
    subtitle: "View, search, and manage all platform users.",
    search: {
      inputHint: "Find a user by name, email, or role",
      filterByRole: "Filter by role",
      filterByStatus: "Filter by status",
      totalCount: (n: number) => `${n.toLocaleString()} total`,
    },
    table: {
      name: "Name",
      email: "Email",
      role: "Role",
      status: "Status",
      joined: "Joined",
      lastSeen: "Last seen",
      action: "Action",
    },
    roles: {
      student: "Student",
      sponsor: "Sponsor",
      university: "University",
      admin: "Admin",
      agent: "Agent",
      partner: "Partner",
    },
    statusLabels: {
      active: "Active",
      suspended: "Suspended",
      pending: "Pending verification",
    },
    actions: {
      view: "View profile",
      suspend: "Suspend account",
      reinstate: "Reinstate account",
      impersonate: "Impersonate",
      exportData: "Export data",
    },
    suspendDialog: {
      title: "Suspend this account?",
      description:
        "The user will lose access immediately. You can reinstate them at any time.",
      reasonLabel: "Reason (internal, not shown to user)",
      reasonHint: "Summarise the reason — stored in the internal audit log.",
      confirmCta: "Suspend account",
      cancel: "Cancel",
    },
    kycOverrideDialog: {
      title: "Override KYC verification?",
      description: "This will mark the user as KYC verified without provider confirmation. Use only after manually reviewing their identity documents.",
      noteLabel: "Admin note (required)",
      noteHint: "Document why this override is justified.",
      confirmCta: "Verify manually",
      cancel: "Cancel",
      success: "KYC status updated to verified.",
    },
    issueCertDialog: {
      title: "Manually issue certificate?",
      description: "This will generate a proof-of-funds certificate for this student with the payment status set to waived.",
      noteLabel: "Admin note (required)",
      noteHint: "Document why this certificate is being issued manually.",
      confirmCta: "Issue certificate",
      cancel: "Cancel",
      success: "Certificate issued.",
    },
    reinstateSuccess: "Account reinstated.",
    suspendSuccess: "Account suspended.",
    empty: {
      title: "No users found",
      description: "Adjust your filters or search term to find users.",
    },
    error: {
      title: "Failed to load users",
      description: "Please refresh the page to try again.",
    },
  },

  operations: {
    title: "Operations",
    subtitle: "Certificate issuance pipeline. Review submissions and take batch actions.",
    stats: {
      pending: "Pending review",
      approvedToday: "Approved today",
      rejectedToday: "Rejected today",
      moreInfo: "More info needed",
    },
    filters: {
      searchPlaceholder: "Name, email address, or student ID", // copy-audit-disable
      all: "All",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      moreInfoRequested: "More info needed",
      expired: "Expired",
    },
    table: {
      student: "Student",
      documentType: "Document type",
      university: "University",
      tier: "Tier",
      submitted: "Submitted",
      reviewer: "Reviewer",
      action: "Action",
    },
    statusLabels: {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      moreInfoRequested: "More info needed",
      expired: "Expired",
    },
    tierLabels: {
      tier1: "Tier 1",
      tier2: "Tier 2",
      unverified: "Unverified",
    },
    actions: {
      review: "Review",
      approve: "Approve",
      reject: "Reject",
      requestInfo: "Request info",
      exportLog: "Export log",
      bulkApprove: "Approve batch",
      bulkReject: "Reject batch",
      bulkRequestInfo: "Request info",
      clearSelection: "Clear selection",
    },
    reviewDialog: {
      title: "Review document",
      studentLabel: "Student",
      documentTypeLabel: "Document type",
      universityLabel: "University",
      submittedLabel: "Submitted",
      notesLabel: "Decision notes",
      notesPlaceholder: "Be specific — this note goes directly to the student and becomes part of their permanent record", // copy-audit-disable
      approveCta: "Approve document",
      rejectCta: "Reject document",
      requestInfoCta: "Request more info",
      cancel: "Cancel",
      viewDocument: "View document",
      deleteCta: "Delete document",
      deleteConfirmTitle: "Delete document?",
      deleteConfirmDescription:
        "This will permanently remove the document from storage and the database. The student will need to re-upload.",
    },
    bulkBar: {
      approve: "Approve batch",
      reject: "Reject batch",
      requestInfo: "Request info",
      clearSelection: "Clear selection",
    },
    empty: {
      title: "Queue empty",
      description: "No documents match your current filters.",
    },
  },

  analytics: {
    title: 'Platform analytics',
    subtitle: 'Aggregate metrics across all users and transactions.',
    stats: {
      totalUsers: { label: 'Total users', sub: 'all roles' },
      totalStudents: { label: 'Students', sub: 'registered on platform' },
      totalSponsors: { label: 'Sponsors', sub: 'registered on platform' },
      totalSponsorships: { label: 'Sponsorships', sub: 'all time' },
      totalCommitted: { label: 'Total committed', sub: 'across active sponsorships' },
      totalDisbursed: { label: 'Total disbursed', sub: 'all time' },
      pendingDocuments: { label: 'Pending documents', sub: 'awaiting review' },
      approvedDocuments: { label: 'Approved documents', sub: 'all time' },
      issuedCertificates: { label: 'Certificates issued', sub: 'proof of funds' },
      kycVerified: { label: 'KYC verified students', sub: 'identity confirmed' },
    },
    error: { title: 'Failed to load analytics', description: 'Please refresh the page to try again.' },
  },

  risk: {
    title: 'Risk flags',
    subtitle: 'Users with patterns that require attention.',
    empty: {
      title: 'No risk flags',
      description: 'All users are within normal activity patterns.',
    },
    typeLabels: {
      repeated_kyc_failure: 'Repeated KYC failure',
      repeated_document_rejection: 'Repeated document rejection',
      unverified_with_active_sponsorship: 'Unverified with active sponsorship',
      duplicate_kyc_reference: 'Duplicate KYC reference',
      ghost_students: 'Agent with high incomplete rate',
      rapid_sponsor_switching: 'Rapid sponsor switching',
    },
    severityLabels: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    },
    error: { title: 'Failed to load risk flags', description: 'Please refresh the page to try again.' },
  },

  peakSeason: {
    title: 'Peak season',
    badge: 'Peak season active',
    metrics: {
      currentWeekVolume: 'This week',
      baselineWeeklyVolume: 'Baseline weekly',
      volumeMultiplier: 'Volume multiplier',
    },
    normal: 'Volume is within normal range.',
    error: { title: 'Failed to load peak season data', description: 'Please refresh the page to try again.' },
  },

  settings: {
    title: 'Platform settings',
    subtitle: 'Configuration and administrative preferences.',
    sections: {
      security: {
        title: 'Security & compliance',
        description: 'Configure platform-wide security policies. Advanced settings are managed via the Doculet admin API.',
        comingSoon: 'Additional security controls will be available here.',
      },
      notifications: {
        title: 'System notifications',
        description: 'Configure where critical platform alerts are sent.',
        comingSoon: 'Alert routing to email, Slack, or webhooks is managed by the Doculet operations team. Contact support to configure notification channels.',
      },
    },
  },

  impersonation: {
    banner: (email: string) => `Viewing as ${email}`,
    endSession: 'End session',
    startCta: 'View as user',
    confirmTitle: 'View as this user?',
    confirmDescription: 'You will see the platform as this user sees it. All actions are logged in the audit trail.',
    confirmCta: 'Start viewing',
    cancel: 'Cancel',
    cannotImpersonateAdmin: 'Admin accounts cannot be impersonated.',
    cannotImpersonateSelf: 'You cannot impersonate yourself.',
    sessionEnded: 'Impersonation session ended.',
  },

  overview: {
    welcomeTitle: 'Platform overview',
    subtitle: 'Platform health at a glance. Every action audited.',
    stats: {
      pendingReview: { label: 'Pending review', sub: 'documents awaiting decision' },
      approvedToday: { label: 'Approved today', sub: 'documents cleared' },
      rejectedToday: { label: 'Rejected today', sub: 'documents returned' },
      riskFlags: { label: 'Risk flags', sub: 'items requiring attention' },
    },
    recentOperations: {
      heading: 'Recent operations',
      empty: 'No pending operations. All queues are clear.',
      viewAll: 'View all operations',
    },
  },

  journey: {
    stages: {
      review_queue: 'Review queue',
      resolve_flags: 'Resolve flags',
      platform_health: 'Platform health',
    },
    nextActions: {
      review_queue: {
        label: 'Review pending items',
        description: 'Items in the queue need your attention before they can proceed.',
        cta: 'Open operations',
        href: '/dashboard/admin/operations',
      },
      resolve_flags: {
        label: 'Resolve flagged items',
        description: 'Flagged items require investigation and resolution.',
        cta: 'View risk flags',
        href: '/dashboard/admin/risk',
      },
      platform_health: {
        label: 'Monitor platform health',
        description: 'All queues are clear. Monitor system health and performance.',
        cta: 'View system status',
        href: '/dashboard/admin/operations',
      },
    },
    completionMessage: 'All queues clear. Platform is operating normally.',
  },

  nav: {
    dashboard: "Dashboard",
    documents: "Document review",
    users: "Users",
    settings: "Settings",
    auditLog: "Audit log",
  },

  errors: commonErrors,
} as const;

export type AdminCopy = typeof adminCopy;
