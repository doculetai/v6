import { commonErrors } from "./shared";

export const universityCopy = {
  overview: {
    title: "Overview",
    subtitle: "Here's what needs your attention today.",
    metrics: {
      pending: "Pending verifications",
      approvedToday: "Approved today",
      flagged: "Flagged items",
      totalStudents: "Total students",
    },
    activity: {
      sectionTitle: "Recent activity",
      emptyLabel: "No recent activity.",
      eventTitles: {
        pending: "Document submitted",
        approved: "Document approved",
        rejected: "Document rejected",
        more_info_requested: "More info requested",
      } as Record<string, string>,
      documentTypes: {
        passport: "Passport",
        bank_statement: "Bank statement",
        offer_letter: "Offer letter",
        affidavit: "Affidavit",
        cac: "CAC document",
      } as Record<string, string>,
    },
    empty: {
      heading: "No verifications yet",
      body: "Student proof-of-funds submissions will appear here once they submit their documents.",
      action: "Review pipeline",
      actionHref: "/dashboard/university/pipeline",
    },
    error: {
      heading: "Failed to load overview",
      body: "We couldn't load the dashboard data. Please try again.",
      retry: "Retry",
    },
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
      notesHint: "Share feedback or next steps with the applicant.",
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
      inputHint: "e.g. DOC-2025-A1B2C3D4",
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
    subtitle: "All students enrolled at your institution.",
    table: {
      student: "Student",
      program: "Program",
      kycStatus: "KYC status",
      documents: "Documents",
      enrolled: "Enrolled",
    },
    kycLabels: {
      not_started: "Not started",
      pending: "Pending",
      verified: "Verified",
      failed: "Failed",
    },
    empty: {
      title: "No students enrolled",
      description: "Students who apply to your institution will appear here.",
    },
  },

  documents: {
    title: "Document queue",
    subtitle: "Review and approve student document submissions.",
    table: {
      student: "Student",
      type: "Document type",
      uploaded: "Uploaded",
      status: "Status",
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
    actions: { view: "View", approve: "Approve", reject: "Reject" },
    rejectReasonLabel: "Reason for rejection",
    rejectReasonHint: "Briefly explain why this document was rejected.",
    rejectConfirm: "Confirm rejection",
    rejectCancel: "Cancel",
    empty: {
      title: "No documents in queue",
      description: "Student document submissions will appear here for review.",
    },
  },

  settings: {
    title: "Settings",
    subtitle: "Manage your institution profile.",
    profile: {
      title: "Institution profile",
      organizationNameLabel: "Organisation name",
      schoolNameLabel: "Linked school",
      schoolNameHint: "Contact support to change your linked school.",
      saveLabel: "Save changes",
      savingLabel: "Saving\u2026",
    },
    errors: { saveError: "Failed to save settings. Please try again." },
  },

  nav: {
    pipeline: "Pipeline",
    verify: "Verify certificate",
    settings: "Settings",
  },

  errors: commonErrors,
} as const;

export type UniversityCopy = typeof universityCopy;
