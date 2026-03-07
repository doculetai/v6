import { captureException } from '@sentry/nextjs';
import { Resend } from 'resend';

import { emailCopy } from '@/config/copy/email';

import { SponsorshipStatusEmail } from './templates/sponsorship-status-email';

const DEFAULT_FROM_EMAIL = 'Doculet <noreply@doculet.ai>';
const DEFAULT_APP_URL = 'https://app.doculet.ai';

type SponsorshipStatus = 'accepted' | 'declined' | 'withdrawn';

type SendSponsorshipStatusEmailParams = {
  toEmail: string;
  status: SponsorshipStatus;
};

const COPY_BY_STATUS = {
  accepted: emailCopy.sponsorshipAccepted,
  declined: emailCopy.sponsorshipDeclined,
  withdrawn: emailCopy.sponsorshipWithdrawn,
} as const;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  return new Resend(apiKey);
}

export async function sendSponsorshipStatusEmail({
  toEmail,
  status,
}: SendSponsorshipStatusEmailParams) {
  const resend = getResendClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;
  const DASHBOARD_URL_BY_STATUS: Record<SponsorshipStatus, string> = {
    accepted: `${baseUrl}/dashboard/student`,
    declined: `${baseUrl}/dashboard/student/invite-sponsor`,
    withdrawn: `${baseUrl}/dashboard/student/overview`,
  };
  const dashboardUrl = DASHBOARD_URL_BY_STATUS[status];

  const copy = COPY_BY_STATUS[status];

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
      to: toEmail,
      subject: copy.subject,
      react: SponsorshipStatusEmail({ copy, dashboardUrl }),
    });

    if (response.error) throw new Error(response.error.message);
    return response.data?.id ?? null;
  } catch (error) {
    captureException(error, {
      tags: { domain: 'lifecycle-emails', operation: 'send-sponsorship-status' },
      extra: { toEmail, status },
    });
    throw error;
  }
}
