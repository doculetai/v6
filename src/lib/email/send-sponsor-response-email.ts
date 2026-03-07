import { captureException } from '@sentry/nextjs';
import { Resend } from 'resend';

import { emailCopy } from '@/config/copy/email';

import { SponsorResponseEmail } from './templates/sponsor-response-email';

const DEFAULT_FROM_EMAIL = 'Doculet <noreply@doculet.ai>';
const DEFAULT_APP_URL = 'https://app.doculet.ai';

type SponsorResponseStatus = 'accepted' | 'declined';

type SendSponsorResponseEmailParams = {
  toEmail: string;
  status: SponsorResponseStatus;
};

const DASHBOARD_URL_BY_STATUS: Record<SponsorResponseStatus, string> = {
  accepted: '/dashboard/student',
  declined: '/dashboard/student/overview',
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  return new Resend(apiKey);
}

export async function sendSponsorResponseEmail({
  toEmail,
  status,
}: SendSponsorResponseEmailParams) {
  const resend = getResendClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;
  const dashboardUrl = `${baseUrl}${DASHBOARD_URL_BY_STATUS[status]}`;
  const copy =
    status === 'accepted' ? emailCopy.sponsorAcceptedInvite : emailCopy.sponsorDeclinedInvite;

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
      to: toEmail,
      subject: copy.subject,
      react: SponsorResponseEmail({ status, dashboardUrl }),
    });

    if (response.error) throw new Error(response.error.message);
    return response.data?.id ?? null;
  } catch (error) {
    captureException(error, {
      tags: { domain: 'lifecycle-emails', operation: 'send-sponsor-response' },
      extra: { toEmail, status },
    });
    throw error;
  }
}
