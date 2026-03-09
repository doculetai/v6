export const emailCopy = {
  sponsorInvitation: {
    subject: 'You have a new sponsorship invitation on Doculet.ai',
    heading: 'A student invited you to sponsor their education',
    body:
      'Sign in to your sponsor dashboard to review the invitation and accept or decline it.',
    ctaLabel: 'Open Sponsor Dashboard',
    footer:
      'This invitation helps students prove funds for school enrollment. If this was unexpected, you can ignore this email.',
  },

  documentApproved: {
    subject: 'Your document has been approved — Doculet.ai',
    heading: 'Document approved',
    body:
      'Your submitted document has been reviewed and approved. Your application continues to the next step.',
    ctaLabel: 'View Documents',
    footer:
      'If you have questions about your application, sign in to your dashboard for the latest status.',
  },

  documentRejected: {
    subject: 'Action required: Document submission — Doculet.ai',
    heading: 'Document requires resubmission',
    body:
      'Your submitted document could not be accepted. Please review the reason below and resubmit with the correct information.',
    ctaLabel: 'Resubmit Document',
    footer:
      'If you believe this is an error, sign in to your dashboard and contact support with your reference number.',
  },

  documentMoreInfoRequested: {
    subject: 'Additional information requested — Doculet.ai',
    heading: 'Additional information required',
    body:
      'Our review team has requested additional information regarding your document submission. Please review the note below and respond accordingly.',
    ctaLabel: 'View Documents',
    footer:
      'Sign in to your dashboard to provide the requested information and continue your application.',
  },

  certificateIssued: {
    subject: 'Your proof of funds certificate is ready — Doculet.ai',
    heading: 'Your proof of funds certificate is ready',
    body:
      'Your proof of funds certificate has been issued and is available on your dashboard. You may download, share, or present it to your institution.',
    ctaLabel: 'View Certificate',
    footer:
      'This certificate was issued by Doculet.ai on behalf of your verified application. Keep your dashboard credentials secure.',
  },

  dataExportReady: {
    subject: 'Your data export is ready — Doculet.ai',
    heading: 'Your data export is ready for download',
    body:
      'The data export you requested has been prepared. Use the link below to download your file. The link is valid for a limited period.',
    ctaLabel: 'Download Export',
    footer:
      'If you did not request a data export, please contact Doculet.ai support immediately.',
  },

  disbursementFailed: {
    subject: 'Disbursement could not be processed — Doculet.ai',
    heading: 'Disbursement failed',
    body:
      'A disbursement from your account could not be processed. Please review your bank details and available balance, then retry from your dashboard.',
    amountLabel: 'Amount',
    ctaLabel: 'Review Disbursements',
    footer:
      'If this issue persists, contact Doculet.ai support with your account reference number.',
  },

  disbursementSent: {
    subject: 'Disbursement processed — Doculet.ai',
    heading: 'Disbursement sent',
    body:
      'A disbursement has been successfully processed from your account. The funds are on their way to the recipient.',
    amountLabel: 'Amount',
    ctaLabel: 'View Proof of Funds',
    footer:
      'This transaction has been recorded on your account. Sign in to your dashboard for a full record.',
  },

  agentStudentInvite: {
    subject: 'You have been invited to Doculet.ai',
    heading: 'You have been invited to apply on Doculet.ai',
    body:
      'An agent has invited you to begin your proof of funds application on Doculet.ai. Create your account to continue.',
    ctaLabel: 'Create Account',
    footer:
      'Doculet.ai helps students verify proof of funds for university enrollment. If this invitation was unexpected, you may ignore this email.',
  },

  sponsorshipAccepted: {
    subject: 'Your sponsorship has been accepted — Doculet.ai',
    heading: 'Your sponsor has accepted',
    body:
      'Your sponsorship invitation has been accepted. Your application is progressing. Sign in to your dashboard to view the current status.',
    ctaLabel: 'Open Dashboard',
    footer:
      'If you have questions about your sponsorship, sign in to your dashboard for a full record of your application.',
  },

  sponsorshipDeclined: {
    subject: 'Sponsorship invitation declined — Doculet.ai',
    heading: 'Sponsorship invitation declined',
    body:
      'Your sponsorship invitation was declined by the recipient. You may invite a new sponsor or adjust your funding arrangement from your dashboard.',
    ctaLabel: 'Manage Sponsorship',
    footer:
      'If you believe this was an error, contact the sponsor directly and resend an invitation from your dashboard.',
  },

  sponsorshipWithdrawn: {
    subject: 'Sponsor commitment withdrawn — Doculet.ai',
    heading: 'A sponsor has withdrawn their commitment',
    body:
      'A sponsor has withdrawn their commitment from your application. Your proof of funds balance has been updated. Review your application and invite a replacement sponsor if needed.',
    ctaLabel: 'View Application',
    footer:
      'Sign in to your dashboard to review your current funding arrangement and take next steps.',
  },

  universityImport: {
    subject: 'You have been added to Doculet.ai by your institution',
    heading: 'Your institution has added you to Doculet.ai',
    body:
      'Your university has registered your details on Doculet.ai. Create your account to begin your proof of funds application.',
    ctaLabel: 'Create Account',
    footer:
      'Doculet.ai is used by your institution to verify proof of funds for enrollment. If this email was unexpected, contact your institution directly.',
  },

  kycVerified: {
    subject: 'Identity verification complete — Doculet.ai',
    heading: 'Identity verified',
    body:
      'Your identity has been verified. Your application has advanced to the next verification step. Sign in to continue.',
    ctaLabel: 'Continue Verification',
    footer:
      'Your identity was verified using the details you submitted. Sign in to your dashboard to view your full verification status.',
  },

  kycFailed: {
    subject: 'Identity verification unsuccessful — Doculet.ai',
    heading: 'Identity verification unsuccessful',
    body:
      'Your identity check could not be completed. This may be due to a mismatch in your submitted details. Sign in to review the reason and resubmit.',
    ctaLabel: 'Review Verification',
    footer:
      'If you believe this is an error, sign in to your dashboard and submit a manual review request.',
  },

  sponsorAcceptedInvite: {
    subject: 'Your sponsor has accepted — Doculet.ai',
    heading: 'Your sponsor has accepted',
    body:
      'Your sponsorship invitation has been accepted. Your application is progressing. Sign in to your dashboard to view the current status.',
    ctaLabel: 'Open Dashboard',
    footer:
      'If you have questions about your sponsorship, sign in to your dashboard for a full record of your application.',
  },

  sponsorDeclinedInvite: {
    subject: 'Sponsorship invitation declined — Doculet.ai',
    heading: 'Sponsorship invitation declined',
    body:
      'Your sponsorship invitation was declined by the recipient. You may invite a new sponsor or adjust your funding arrangement from your dashboard.',
    ctaLabel: 'Manage Sponsorship',
    footer:
      'If you believe this was an error, contact the sponsor directly and resend an invitation from your dashboard.',
  },

  welcome: {
    subject: 'Your Doculet account is ready',
    heading: 'Welcome to Doculet.',
    headingWithName: (name: string) => `Welcome to Doculet, ${name}.`,
    body: 'Your account is active. Access your dashboard to begin your proof of funds application.',
    ctaLabel: 'Go to dashboard',
    footer: 'Doculet — Proof of Funds Verification. If you did not create this account, contact support.',
  },
} as const;

export type EmailCopy = typeof emailCopy;
