/** University-domain UI primitives — verification, pipeline, review labels */

export const universityPrimitives = {
  pipeline: {
    statusSubmitted: "Submitted",
    statusUnderReview: "Under review",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusMoreInfoRequested: "More info needed",
  },
  kyc: {
    notStarted: "Not started",
    pending: "Pending",
    verified: "Verified",
    failed: "Failed",
  },
  activity: {
    emptyLabel: "No recent activity.",
  },
} as const
