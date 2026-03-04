export const primitivesCopy = {
  labels: {
    invalidDate: "Invalid date",
    metricLoadError: "Unable to load metric",
    clearFilters: "Clear filters",
    loadingContent: "Loading content",
    searchPlaceholder: "Search by name, reference, or status…",
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
