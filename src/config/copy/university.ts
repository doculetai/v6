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

  settings: {
    title: "Settings",
    subtitle: "Manage your institution profile, notifications, and integrations.",

    profile: {
      sectionTitle: "Institution profile",
      sectionSubtitle: "Update your institution name, accreditation body, and contact details.",
      institutionName: {
        label: "Institution name",
        placeholder: "e.g. Massachusetts Institute of Technology",
      },
      accreditationBody: {
        label: "Accreditation body",
        placeholder: "e.g. SACSCOC, HLC, NEASC",
      },
      contactEmail: {
        label: "Contact email",
        placeholder: "admissions@institution.edu",
      },
      contactPhone: {
        label: "Contact phone",
        placeholder: "+1 (617) 000-0000",
      },
      saveButton: "Save profile",
      saving: "Saving\u2026",
      saved: "Saved",
    },

    notifications: {
      sectionTitle: "Email notifications",
      sectionSubtitle: "Choose which events trigger email alerts to your admissions team.",
      onSubmission: {
        label: "New submission",
        description: "When a student submits proof of funds for your institution.",
      },
      onApproval: {
        label: "Application approved",
        description: "When an application is marked as approved.",
      },
      onRejection: {
        label: "Application rejected",
        description: "When an application is rejected or requires action.",
      },
      saveButton: "Save preferences",
      saving: "Saving\u2026",
      saved: "Saved",
    },

    webhook: {
      sectionTitle: "Webhook integration",
      sectionSubtitle:
        "Receive real-time POST events to your admissions system when application statuses change.",
      webhookUrl: {
        label: "Webhook URL",
        placeholder: "https://your-system.edu/webhooks/doculet",
      },
      helpText:
        "Doculet will POST JSON to this URL on submission, approval, and rejection events. Must use HTTPS.",
      saveButton: "Save webhook",
      saving: "Saving\u2026",
      saved: "Saved",
      clearButton: "Remove webhook",
    },

    sessions: {
      sectionTitle: "Active sessions",
      sectionSubtitle: "Devices and browsers currently signed in to your account.",
    },

    errors: {
      profileSave: "Failed to save profile. Please try again.",
      notificationsSave: "Failed to save notification preferences. Please try again.",
      webhookSave: "Failed to save webhook URL. Please try again.",
      sessionRevoke: "Failed to sign out of other sessions. Please try again.",
      forbidden: "You do not have permission to access this page.",
      generic: "Something went wrong. Please refresh and try again.",
    },
  },

  nav: {
    pipeline: "Pipeline",
    verify: "Verify certificate",
    settings: "Settings",
  },

  errors: commonErrors,
} as const;

export type UniversityCopy = typeof universityCopy;
