import { captureException } from '@sentry/nextjs';
import { Resend } from 'resend';

import { emailCopy } from '@/config/copy/email';

import { DataExportReadyEmail } from './templates/data-export-ready-email';

const DEFAULT_FROM_EMAIL = 'Doculet <noreply@doculet.ai>';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  return new Resend(apiKey);
}

export async function sendDataExportReadyEmail(
  toEmail: string,
  downloadUrl: string,
): Promise<string | null> {
  const resend = getResendClient();

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
      to: toEmail,
      subject: emailCopy.dataExportReady.subject,
      react: DataExportReadyEmail({ downloadUrl }),
    });

    if (response.error) throw new Error(response.error.message);
    return response.data?.id ?? null;
  } catch (error) {
    captureException(error, {
      tags: { domain: 'data-export', operation: 'send-data-export-ready' },
      extra: { toEmail },
    });
    throw error;
  }
}
