import { captureException } from '@sentry/nextjs';
import { Resend } from 'resend';

import { emailCopy } from '@/config/copy/email';

import { WelcomeEmail } from './templates/welcome-email';

const DEFAULT_FROM_EMAIL = 'Doculet <noreply@doculet.ai>';
const DEFAULT_APP_URL = 'https://app.doculet.ai';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  return new Resend(apiKey);
}

export async function sendWelcomeEmail({
  to,
  firstName,
  role,
}: {
  to: string;
  firstName: string;
  role: string;
}) {
  const resend = getResendClient();
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL}/dashboard/${role}`;

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
      to,
      subject: emailCopy.welcome.subject,
      react: WelcomeEmail({ firstName, dashboardUrl }),
    });

    if (response.error) throw new Error(response.error.message);
    return response.data?.id ?? null;
  } catch (error) {
    captureException(error, {
      tags: { domain: 'lifecycle-emails', operation: 'send-welcome' },
      extra: { to, role },
    });
    throw error;
  }
}
