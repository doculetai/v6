import { captureException } from '@sentry/nextjs';
import { Resend } from 'resend';

import { emailCopy } from '@/config/copy/email';

import { SponsorInvitationEmail } from './templates/sponsor-invitation-email';

const DEFAULT_FROM_EMAIL = 'Doculet <noreply@doculet.ai>';
const DEFAULT_APP_URL = 'https://app.doculet.ai';

type SendSponsorInvitationEmailParams = {
  toEmail: string;
  studentEmail: string;
  note?: string | null;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY');
  }

  return new Resend(apiKey);
}

export async function sendSponsorInvitationEmail({
  toEmail,
  studentEmail,
  note,
}: SendSponsorInvitationEmailParams) {
  const resend = getResendClient();
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL}/dashboard/sponsor`;

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
      to: toEmail,
      subject: emailCopy.sponsorInvitation.subject,
      react: SponsorInvitationEmail({
        dashboardUrl,
        studentEmail,
        note,
      }),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data?.id ?? null;
  } catch (error) {
    captureException(error, {
      tags: {
        domain: 'sponsor-invitations',
        operation: 'send-invitation-email',
      },
      extra: {
        toEmail,
      },
    });
    throw error;
  }
}
