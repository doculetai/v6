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
} as const;

export type EmailCopy = typeof emailCopy;
