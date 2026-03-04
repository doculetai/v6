import { commonErrors } from "./shared";

export const universityCopy = {
  pipeline: {
    title: "Application pipeline",
    subtitle: "Process applications at scale. Verify in seconds.",
    filters: {
      status: "Status",
      program: "Program",
      dateRange: "Date range",
      search: "Search applicants…",
    },
    table: {
      applicant: "Applicant",
      program: "Program",
      status: "Status",
      submitted: "Submitted",
      lastUpdated: "Last updated",
      action: "Action",
    },
    statusLabels: {
      submitted: "Submitted",
      underReview: "Under review",
      approved: "Approved",
      rejected: "Rejected",
      moreInfoRequested: "More info needed",
      waitlisted: "Waitlisted",
    },
    actions: {
      review: "Review",
      approve: "Approve",
      reject: "Reject",
      requestInfo: "Request info",
      exportCsv: "Export CSV",
      bulkApprove: "Approve selected",
    },
    empty: {
      title: "No applications yet",
      description:
        "Applications from students will appear here once they submit their proof of funds.",
    },
    stats: {
      total: "Total applications",
      pendingReview: "Pending review",
      approvedThisWeek: "Approved this week",
      averageProcessingTime: "Avg. processing time",
    },
    reviewDialog: {
      title: "Review application",
      notesLabel: "Reviewer notes",
      notesPlaceholder: "Add notes visible to the student…",
      approveCta: "Approve",
      rejectCta: "Reject",
      requestInfoCta: "Request more info",
      cancel: "Cancel",
    },
  },

  verifyCert: {
    title: "Verify a certificate",
    subtitle:
      "Enter a certificate token or scan a QR code to instantly verify authenticity.",
    tokenInput: {
      label: "Certificate token",
      placeholder: "e.g. DOC-2024-XXXXXXXX",
      verifyCta: "Verify now",
    },
    qrScan: {
      label: "Scan QR code",
      description: "Point your camera at the QR code on the student's certificate.",
      startScan: "Open camera",
    },
    result: {
      valid: {
        title: "Certificate valid",
        description: "This certificate is authentic and has not been tampered with.",
        issuedTo: "Issued to",
        issuedOn: "Issued on",
        expiresOn: "Expires on",
        program: "Program",
        fundingVerified: "Funding verified",
      },
      expired: {
        title: "Certificate expired",
        description: "This certificate was valid but has since expired.",
      },
      revoked: {
        title: "Certificate revoked",
        description: "This certificate has been revoked and is no longer valid.",
      },
      notFound: {
        title: "Certificate not found",
        description:
          "No certificate matches this token. Check the reference and try again.",
      },
    },
    verifyAnother: "Verify another certificate",
  },

  students: {
    title: "Students",
    subtitle: "All students associated with your institution.",
    search: {
      placeholder: "Search by email, school, or program\u2026",
    },
    filters: {
      all: "All",
      verified: "Verified",
      pending: "Pending",
      failed: "Failed",
    },
    table: {
      student: "Student",
      status: "KYC Status",
      tier: "Tier",
      funding: "Funding",
      submitted: "Submitted",
      school: "School / Program",
    },
    tierLabels: {
      none: "No tier",
      tier1: "Tier 1",
      tier2: "Tier 2",
      tier3: "Tier 3",
    },
    statusLabels: {
      not_started: "Not started",
      pending: "Pending",
      verified: "Verified",
      failed: "Failed",
    },
    metrics: {
      total: "Total students",
      verified: "KYC verified",
      pending: "Pending / not started",
      failed: "KYC failed",
    },
    empty: {
      heading: "No students yet",
      body: "Students who register through your institution will appear here once they create their profile.",
    },
    emptyFiltered: {
      heading: "No matching students",
      body: "Try adjusting your search or changing the status filter.",
    },
    error: {
      heading: "Could not load students",
      body: "There was a problem fetching student data. Please try refreshing the page.",
      retryLabel: "Try again",
    },
  },

  nav: {
    pipeline: "Pipeline",
    students: "Students",
    verify: "Verify certificate",
    settings: "Settings",
  },

  errors: commonErrors,
} as const;

export type UniversityCopy = typeof universityCopy;
