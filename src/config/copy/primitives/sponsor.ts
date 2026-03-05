/** Sponsor-domain UI primitives — disbursement, earnings, commitments */

export const sponsorPrimitives = {
  disbursementFlow: {
    initiated: "Initiated",
    processing: "Processing",
    cleared: "Cleared",
    disbursed: "Disbursed",
    confirmed: "Confirmed",
  },
  earningsPanel: {
    conversionRate: "Conversion rate",
    pendingPayout: "Pending payout",
    totalPaidOut: "Total paid out",
  },
  commitmentTimeline: {
    empty: "No commitment history",
  },
} as const
