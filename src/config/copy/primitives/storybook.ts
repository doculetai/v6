/** Storybook / demo primitives */

export const storybookPrimitives = {
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
    queryHint: "Search by application ID, student name, or case reference",
    tabAriaLabel: "Filter options",
  },
} as const
