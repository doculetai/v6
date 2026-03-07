import { routes } from '@/config/routes';
import { commonErrors } from "./shared";

export const universityCopy = {
  onboarding: {
    title: "Set up your university account",
    subtitle: "Configure your institution profile so students can select your programs.",
    steps: {
      welcome: {
        title: "Welcome",
        heading: "Welcome to Doculet",
        description: "Doculet streamlines proof-of-funds verification for your prospective students. Set up your institution profile to continue.",
        cta: "Continue",
      },
      profile: {
        title: "Institution details",
        heading: "Your institution",
        description: "Confirm your institution details. Students will see this information when selecting their school.",
        institutionNameLabel: "Institution name",
        institutionNamePlaceholder: "Enter your institution name",
        countryLabel: "Country",
        countryPlaceholder: "Select country",
        cta: "Save and continue",
      },
      complete: {
        title: "Ready",
        heading: "Your account is ready",
        description: "You can now manage your programmes, track student applications, and monitor enrolment progress. Your dashboard shows all activity across your institution.",
        cta: "Go to dashboard",
      },
    },
    progress: "{current} of {total}",
  },
  overview: {
    welcomeTitle: "University overview",
    title: "Overview",
    subtitle: "Programme and enrolment summary for your institution.",
    metrics: {
      totalPrograms: "Active programmes",
      enrolledStudents: "Enrolled students",
      pendingApplications: "Pending applications",
      totalStudents: "Total students",
    },
    empty: {
      heading: "No programmes yet",
      body: "Add programmes to your institution so students can apply and submit proof of funds.",
      action: "Manage programmes",
      actionHref: routes.dashboard.university.programs,
    },
    error: {
      heading: "Failed to load overview",
      body: "Unable to load the dashboard data. Please try again.",
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
      documents: "Documents",
      kycStatus: "KYC status",
    },
    kycLabels: {
      not_started: "Not started",
      pending: "Pending",
      verified: "Verified",
      failed: "Failed",
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

  programs: {
    title: 'Programs',
    subtitle: 'Manage programs and tuition requirements.',
    table: {
      name: 'Program name',
      tuition: 'Tuition',
      duration: 'Duration',
      students: 'Students',
      status: 'Status',
      actions: 'Actions',
    },
    statusLabels: {
      active: 'Active',
      inactive: 'Inactive',
    },
    addProgram: 'Add program',
    addProgramDescription: 'Create a new program at your institution.',
    form: {
      nameLabel: 'Program name',
      namePlaceholder: 'e.g. BSc Computer Science',
      tuitionLabel: 'Tuition amount (NGN)',
      tuitionPlaceholder: 'e.g. 2500000',
      currencyLabel: 'Currency',
      durationLabel: 'Duration (months)',
      durationPlaceholder: 'e.g. 48',
      submitLabel: 'Create program',
      submittingLabel: 'Creating\u2026',
    },
    durationUnit: 'months',
    success: 'Program created successfully.',
    error: 'Failed to create program. Please try again.',
    empty: { title: 'No programs yet', description: 'Add programs to accept student applications.' },
    editDialog: {
      title: 'Edit program',
      description: 'Update program details.',
      saveCta: 'Save changes',
      saving: 'Saving\u2026',
      success: 'Program updated.',
    },
    deactivate: {
      cta: 'Deactivate',
      confirmTitle: 'Deactivate program',
      confirmDescription: 'Students will no longer be able to enrol in this program. This can be reversed.',
      confirmCta: 'Deactivate',
      cancelCta: 'Cancel',
      success: 'Program deactivated.',
    },
    exportStudents: {
      cta: 'Export students',
      description: 'Download a CSV of all students at your institution.',
      empty: 'No student data to export.',
    },
  },
  reports: {
    title: 'Reports',
    subtitle: 'Analytics and reporting.',
    metrics: {
      totalStudents: 'Total students',
      verifiedStudents: 'Verified students',
      pendingVerifications: 'Pending verifications',
      rejectedDocuments: 'Rejected documents',
      totalPrograms: 'Programs offered',
      approvalRate: 'Approval rate',
    },
    sections: {
      overview: 'Overview metrics',
      breakdown: 'Status breakdown',
    },
    empty: { title: 'No reports yet', description: 'Report data will appear here once students enrol.' },
  },
  team: {
    title: 'Team',
    subtitle: 'Staff management and permissions.',
    table: {
      name: 'Name',
      email: 'Email',
      role: 'Role',
      added: 'Added',
      actions: 'Actions',
    },
    addMember: 'Add team member',
    addMemberDescription: 'Invite a staff member to access your dashboard.',
    form: {
      nameLabel: 'Full name',
      namePlaceholder: 'e.g. Adebayo Johnson',
      emailLabel: 'Email address',
      emailPlaceholder: 'e.g. adebayo@university.edu.ng',
      roleLabel: 'Role',
      submitLabel: 'Add member',
      submittingLabel: 'Adding\u2026',
    },
    roleLabels: {
      admin: 'Admin',
      reviewer: 'Reviewer',
      viewer: 'Viewer',
    } as Record<string, string>,
    removeConfirmTitle: 'Remove team member',
    removeConfirmDescription: 'Are you sure you want to remove this member? This action cannot be undone.',
    removeConfirmAction: 'Remove',
    removeCancel: 'Cancel',
    success: 'Team member added.',
    removeSuccess: 'Team member removed.',
    error: 'Failed to update team. Please try again.',
    empty: { title: 'No team members', description: 'Add staff to help with verification.' },
  },
  import: {
    title: 'Bulk import',
    subtitle: 'Import students in bulk via email addresses.',
    instructions: 'Paste email addresses (one per line) or upload a CSV file with an "email" column.',
    textareaPlaceholder: 'student1@example.com\nstudent2@example.com',
    uploadLabel: 'Or upload CSV',
    previewTitle: 'Preview',
    previewDescription: 'Review the email addresses before sending invites.',
    emailCount: 'emails parsed',
    submitLabel: 'Send invites',
    submittingLabel: 'Sending\u2026',
    success: 'Invitations sent successfully.',
    error: 'Failed to send some invitations. Please try again.',
    invalidEmails: 'Some entries are not valid email addresses and were excluded.',
    empty: { title: 'Import students', description: 'Upload a CSV or paste emails to add multiple students at once.' },
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
      savedLabel: "Settings saved.",
      validation: {
        orgNameMin: "Organisation name must be at least 2 characters.",
        orgNameMax: "Organisation name must be at most 120 characters.",
      },
    },
    errors: {
      saveError: "Failed to save settings. Please try again.",
      loadError: "Unable to load settings. Please try again.",
      tryAgain: "Try again",
    },
  },

  journey: {
    stages: {
      manage_programmes: 'Manage programmes',
      receive_applications: 'Receive applications',
      monitor_enrolment: 'Monitor enrolment',
    },
    nextActions: {
      manage_programmes: {
        label: 'Set up your programmes',
        description: 'Add programmes to your institution so students can apply.',
        cta: 'Manage programmes',
        href: routes.dashboard.university.programs,
      },
      receive_applications: {
        label: 'Awaiting student submissions',
        description: 'Student proof-of-funds applications will appear in the pipeline when submitted.',
        cta: 'View pipeline',
        href: routes.dashboard.university.pipeline,
      },
      monitor_enrolment: {
        label: 'Monitor enrolment pipeline',
        description: 'Track application status and enrolment progress across your institution.',
        cta: 'View pipeline',
        href: routes.dashboard.university.pipeline,
      },
    },
    completionMessage: 'Programme configuration is complete.',
  },

  welcome: {
    title: 'Welcome to Doculet',
    subtitle: 'Here is how to manage your institution on the platform.',
    steps: [
      { label: 'Add your programmes', description: 'Create the degree programmes at your institution. Students select from your programme list when applying.' },
      { label: 'Track the application pipeline', description: 'View all students applying to your institution. Monitor their verification status and enrolment progress.' },
      { label: 'Monitor enrolment', description: 'Track KYC completion and application progress across your institution from the overview dashboard.' },
    ],
    dismiss: 'Got it',
  },

  nav: {
    pipeline: "Pipeline",
    verify: "Verify certificate",
    settings: "Settings",
  },

  errors: commonErrors,
} as const;

export type UniversityCopy = typeof universityCopy;
