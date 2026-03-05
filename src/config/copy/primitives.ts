export const primitivesCopy = {
  labels: {
    invalidDate: "Invalid date",
    metricLoadError: "Unable to load metric",
    clearFilters: "Clear filters",
    loadingContent: "Loading content",
    searchPlaceholder: "Search by name, reference, or status…", // copy-audit-disable
    toggleTheme: "Toggle theme",
  },
  fileUploader: {
    dropzone: "Drop file here or click to browse",
    releaseToUpload: "Release to upload",
    errorInvalidType: "This file type is not supported",
    errorFileTooLarge: "File must be under 10MB",
    constraintsDefault: "PDF, JPG, PNG · Max 10MB",
  },
  aria: {
    activityTimeline: "Activity timeline",
    pipelineSteps: "Pipeline steps",
    maskedValueShow: "Show value",
    maskedValueHide: "Hide value",
    disbursementProgress: "Disbursement progress",
  },
  statusBadge: {
    pending: "Pending",
    verified: "Verified",
    rejected: "Rejected",
    attention: "Attention needed",
    expired: "Expired",
  },
  disbursementFlow: {
    initiated: "Initiated",
    processing: "Processing",
    cleared: "Cleared",
    disbursed: "Disbursed",
    confirmed: "Confirmed",
  },
  sessionManagement: {
    thisDevice: "This device",
    activeSession: "Active session",
    revokeSession: "Revoke session",
    revoke: "Revoke",
    noOtherSessions: "No other active sessions. You are signed in on this device only.",
    lastActive: "Last active",
    title: "Active Sessions",
    description: "Devices and browsers currently signed in to your account.",
    signOutAllOthers: "Sign out of all other sessions",
    browsers: {
      Chrome: "Google Chrome",
      Safari: "Safari",
      Firefox: "Mozilla Firefox",
      Edge: "Microsoft Edge",
      Opera: "Opera",
      Unknown: "Unknown browser",
    },
    devices: {
      desktop: "Desktop",
      mobile: "Mobile device",
      tablet: "Tablet",
      unknown: "Unknown device",
    },
  },
  themeToggle: {
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
  },
  moneyValue: {
    defaultCurrency: "NGN",
  },
  earningsPanel: {
    conversionRate: "Conversion rate",
    pendingPayout: "Pending payout",
    totalPaidOut: "Total paid out",
  },
  iconAudit: {
    title: "Icon Audit",
    description: "Canonical semantic icon mapping for enterprise routes.",
  },
  dialog: {
    closeSrOnly: "Close",
  },
  // ── Actions (buttons, links) ─────────────────────────────────────────────
  actions: {
    save: "Save",
    cancel: "Cancel",
    submit: "Submit",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    remove: "Remove",
    create: "Create",
    update: "Update",
    confirm: "Confirm",
    dismiss: "Dismiss",
    retry: "Retry",
    back: "Back",
    next: "Next",
    previous: "Previous",
    done: "Done",
    continue: "Continue",
    export: "Export",
    import: "Import",
    refresh: "Refresh",
  },

  // ── Form validation ──────────────────────────────────────────────────────
  validation: {
    required: "This field is required",
    invalidEmail: "Please enter a valid email address",
    minLength: (n: number) => `Must be at least ${n} characters`,
    maxLength: (n: number) => `Must be at most ${n} characters`,
    invalidFormat: "Invalid format",
    passwordMismatch: "Passwords do not match",
    passwordTooWeak: "Password is too weak",
    invalidPhone: "Please enter a valid phone number",
    invalidDateRange: "End date must be after start date",
    invalidAmount: "Please enter a valid amount",
    fileRequired: "Please select a file",
  },

  // ── Empty states ─────────────────────────────────────────────────────────
  empty: {
    noResults: "No results found",
    noData: "No data available",
    nothingHere: "Nothing here yet",
    noRecords: "No records to display",
    noItems: "No items",
    noMatches: "No matches for your search",
    startByAdding: "Start by adding something",
    emptyList: "This list is empty",
    noNotifications: "No notifications",
    noMessages: "No messages",
  },

  // ── Loading states ───────────────────────────────────────────────────────
  loading: {
    default: "Loading…",
    pleaseWait: "Please wait…",
    processing: "Processing…",
    saving: "Saving…",
    uploading: "Uploading…",
  },

  // ── Pagination ───────────────────────────────────────────────────────────
  pagination: {
    previous: "Previous",
    next: "Next",
    first: "First",
    last: "Last",
    page: "Page {n}",
    of: "of {total}",
    perPage: "per page",
    showMore: "Show more",
    showLess: "Show less",
  },

  // ── Confirmation dialogs ─────────────────────────────────────────────────
  confirm: {
    areYouSure: "Are you sure?",
    cannotUndo: "This action cannot be undone.",
    deleteConfirm: "Are you sure you want to delete this?",
    leaveConfirm: "You have unsaved changes. Leave anyway?",
    discardChanges: "Discard changes?",
    proceed: "Proceed",
    stay: "Stay",
  },

  // ── Toast / notifications ────────────────────────────────────────────────
  toast: {
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
    saved: "Saved successfully",
    deleted: "Deleted successfully",
    updated: "Updated successfully",
    failed: "Something went wrong",
    copied: "Copied to clipboard",
  },

  // ── Form labels & placeholders ───────────────────────────────────────────
  form: {
    email: "Email",
    password: "Password",
    name: "Name",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone number",
    address: "Address",
    city: "City",
    country: "Country",
    optional: "(optional)",
    required: "(required)",
    selectPlaceholder: "Select an option…",
    searchPlaceholder: "Search…",
    noOptions: "No options found",
    typeToSearch: "Type to search…",
  },

  // ── Date/time relative ───────────────────────────────────────────────────
  dateTime: {
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    now: "Now",
    justNow: "Just now",
    minutesAgo: (n: number) => `${n} minutes ago`,
    hoursAgo: (n: number) => `${n} hours ago`,
    daysAgo: (n: number) => `${n} days ago`,
    inMinutes: (n: number) => `in ${n} minutes`,
    inHours: (n: number) => `in ${n} hours`,
    inDays: (n: number) => `in ${n} days`,
  },

  // ── Table / data grid ────────────────────────────────────────────────────
  table: {
    sortBy: "Sort by",
    filter: "Filter",
    exportCsv: "Export as CSV",
    selectAll: "Select all",
    clearSelection: "Clear selection",
    selectedCount: "{n} selected",
    noColumns: "No columns",
    loadingRows: "Loading rows…",
  },

  // ── Breadcrumb / navigation ──────────────────────────────────────────────
  nav: {
    home: "Home",
    dashboard: "Dashboard",
    settings: "Settings",
    profile: "Profile",
    help: "Help",
    signOut: "Sign out",
    signIn: "Sign in",
  },

  // ── Status (extended) ────────────────────────────────────────────────────
  status: {
    active: "Active",
    inactive: "Inactive",
    draft: "Draft",
    published: "Published",
    archived: "Archived",
    completed: "Completed",
    inProgress: "In progress",
    cancelled: "Cancelled",
    failed: "Failed",
    scheduled: "Scheduled",
  },

  // ── Currency codes ───────────────────────────────────────────────────────
  currency: {
    NGN: "NGN",
    USD: "USD",
    GBP: "GBP",
    EUR: "EUR",
    CAD: "CAD",
    AUD: "AUD",
  },

  // ── Accessibility (extended aria) ────────────────────────────────────────
  ariaExtended: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    openDialog: "Open dialog",
    closeDialog: "Close dialog",
    expand: "Expand",
    collapse: "Collapse",
    selectAll: "Select all",
    deselectAll: "Deselect all",
    loading: "Loading",
    error: "Error",
    success: "Success",
  },

  storybook: {
    pageHeader: {
      title: "Verification Pipeline",
      subtitle: "Track critical funding and compliance milestones.",
      actionPrimary: "Export",
      actionSecondary: "Refresh",
      meta: "Last sync: 2 minutes ago",
      emptyTitle: "No data source selected",
      emptySubtitle: "Choose a source to view pipeline health.",
      errorTitle: "Pipeline unavailable",
      errorSubtitle: "Connection timed out. Retry in a moment.",
    },
    metricCard: {
      label: "Committed Funding",
      value: "USD 120,450",
      deltaLabel: "vs previous 7 days",
      deltaValue: "+8.2%",
      emptyValue: "--",
      loadingLabel: "Queued Reviews",
      errorLabel: "Metric unavailable",
    },
    surfacePanel: {
      content: "Panel body content",
      loading: "Loading panel state",
      empty: "No records available",
      error: "Panel could not load",
    },
    moneyValue: {
      defaultCode: "USD",
      compactCode: "NGN",
    },
    timestampLabel: {
      valid: "2026-03-01T10:30:00Z",
      invalid: "not-a-date",
    },
    dataTableShell: {
      empty: "No records to show.",
      headers: {
        name: "Name",
        status: "Status",
        updated: "Updated",
      },
    },
    pipelineStepper: {
      ariaLabel: "Verification stages",
    },
    activityTimeline: {
      empty: "No activity recorded.",
    },
    commitmentTimeline: {
      empty: "No commitment history",
    },
    filterBar: {
      queryPlaceholder: "Search applications, students, or case references…", // copy-audit-disable
      tabAriaLabel: "Filter options",
    },
  },
} as const

export type PrimitivesCopy = typeof primitivesCopy
