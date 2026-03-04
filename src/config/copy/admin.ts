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
    empty: {
      title: "No users found",
      description: "Adjust your filters or search term to find users.",
    },
  },

  analytics: {
    title: "Analytics",
    subtitle: "Platform performance and business intelligence.",
    period: {
      week: "By week",
      month: "By month",
    },
    metrics: {
      approvalRate: "Approval rate",
      approvalRateSuffix: "of reviewed docs",
      avgReviewTime: "Avg. review time",
      avgReviewTimeSuffix: "hours to decision",
    },
    chart: {
      title: "Applications over time",
      subtitle: "New platform registrations",
      empty: "No registration data for this period.",
      ariaLabel: "Bar chart showing platform applications over time",
    },
    topUniversities: {
      title: "Top universities",
      table: {
        university: "University",
        students: "Students",
      },
      empty: {
        title: "No university data",
        description: "University breakdown appears as students complete onboarding.",
      },
    },
    fundingBreakdown: {
      title: "Funding type",
      types: {
        self: "Self-funded",
        sponsor: "Sponsored",
        corporate: "Corporate",
      },
      empty: {
        title: "No funding data",
        description: "Funding breakdown appears as students register.",
      },
    },
    documentStatus: {
      title: "Document status",
      statuses: {
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
        more_info_requested: "Info needed",
      },
      empty: {
        title: "No documents",
        description: "Document status breakdown appears as students submit documents.",
      },
    },
    error: {
      title: "Failed to load analytics",
      description: "An error occurred loading analytics data. Please try refreshing.",
      retryLabel: "Try again",
    },
    forbidden: {
      title: "Access restricted",
      description: "Analytics is only available to admin users.",
    },
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
