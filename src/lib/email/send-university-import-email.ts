import { captureException } from '@sentry/nextjs';
import { Resend } from 'resend';

import { emailCopy } from '@/config/copy/email';

import { UniversityImportEmail } from './templates/university-import-email';

const DEFAULT_FROM_EMAIL = 'Doculet <noreply@doculet.ai>';
const DEFAULT_APP_URL = 'https://app.doculet.ai';

type SendUniversityImportEmailParams = {
  toEmail: string;
  universityName: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY');
  }

  return new Resend(apiKey);
}

export async function sendUniversityImportEmail({
  toEmail,
  universityName,
}: SendUniversityImportEmailParams) {
  const resend = getResendClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;
  const signupUrl = `${appUrl}/signup`;

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
      to: toEmail,
      subject: emailCopy.universityImport.subject,
      react: UniversityImportEmail({
        signupUrl,
        universityName,
      }),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data?.id ?? null;
  } catch (error) {
    captureException(error, {
      tags: {
        domain: 'university-import',
        operation: 'send-import-email',
      },
      extra: {
        toEmail,
      },
    });
    throw error;
  }
}
