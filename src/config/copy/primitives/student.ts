/** Student-domain UI primitives — shared labels, empty states, etc. */

export const studentPrimitives = {
  verification: {
    statusNotStarted: "Not started",
    statusPending: "Pending",
    statusVerified: "Verified",
    statusFailed: "Failed",
  },
  documents: {
    emptyTitle: "No documents yet",
    uploadCta: "Upload document",
  },
  schools: {
    searchPlaceholder: "Search by university, program, or city…",
    emptyTitle: "No programs found",
  },
} as const
