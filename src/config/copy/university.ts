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
      notesPlaceholder: "Share feedback or next steps with the applicant.",
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
      placeholder: "e.g. DOC-2025-A1B2C3D4",
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

  nav: {
    pipeline: "Pipeline",
    verify: "Verify certificate",
    settings: "Settings",
  },

  errors: commonErrors,
} as const;

export type UniversityCopy = typeof universityCopy;
