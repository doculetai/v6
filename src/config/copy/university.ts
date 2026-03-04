import { commonErrors } from "./shared";

export const universityCopy = {
  documents: {
    title: "Document review queue",
    subtitle: "Review student documents submitted for proof-of-funds verification.",
    filters: {
      search: "Search by student email…",
      all: "All",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      moreInfo: "More info needed",
    },
    table: {
      student: "Student",
      type: "Document type",
      status: "Status",
      submitted: "Submitted",
      actions: "Actions",
    },
    typeLabels: {
      passport: "Passport",
      bank_statement: "Bank statement",
      offer_letter: "Offer letter",
      affidavit: "Affidavit",
      cac: "CAC document",
    },
    statusLabels: {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      more_info_requested: "More info needed",
    },
    stats: {
      total: "Total documents",
      pending: "Pending review",
      approved: "Approved",
      moreInfo: "More info needed",
    },
    empty: {
      title: "No documents yet",
      body: "Documents submitted by students will appear here once they upload proof-of-funds materials.",
    },
    emptyFiltered: {
      title: "No documents match",
      body: "Try adjusting your search or filter to find what you are looking for.",
    },
    actions: {
      review: "Review",
      approve: "Approve",
      reject: "Reject",
      requestInfo: "Request info",
      cancel: "Cancel",
    },
    review: {
      title: "Review document",
      student: "Student",
      type: "Document type",
      submitted: "Submitted",
      previewLink: "View document",
      notesLabel: "Notes",
      notesPlaceholder: "Add notes visible to the student…",
      rejectionReasonLabel: "Rejection reason",
      rejectionReasonPlaceholder: "Explain why this document was rejected…",
      rejectionReasonRequired: "A rejection reason is required.",
    },
    tryAgain: "Try again",
  },

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

  nav: {
    pipeline: "Pipeline",
    verify: "Verify certificate",
    settings: "Settings",
  },

  errors: commonErrors,
} as const;

export type UniversityCopy = typeof universityCopy;
