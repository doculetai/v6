/** Shared UI component primitives — labels, aria, dialogs, etc. */

export const uiPrimitives = {
  labels: {
    invalidDate: "Invalid date",
    metricLoadError: "Unable to load metric",
    clearFilters: "Clear filters",
    loadingContent: "Loading content",
    searchPlaceholder: "Filter by name, reference number, or status",
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
  themeToggle: {
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
  },
  moneyValue: {
    defaultCurrency: "NGN",
  },
  iconAudit: {
    title: "Icon Audit",
    description: "Canonical semantic icon mapping for enterprise routes.",
  },
  dialog: {
    closeSrOnly: "Close",
  },
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
} as const
