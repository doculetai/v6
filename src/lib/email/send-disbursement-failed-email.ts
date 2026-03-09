import { captureException } from '@sentry/nextjs';
import { Resend } from 'resend';

import { emailCopy } from '@/config/copy/email';
import { formatCurrency } from '@/lib/utils';

import { DisbursementFailedEmail } from './templates/disbursement-failed-email';

const DEFAULT_FROM_EMAIL = 'Doculet <noreply@doculet.ai>';
const DEFAULT_APP_URL = 'https://app.doculet.ai';

type SendDisbursementFailedEmailParams = {
  toEmail: string;
  amountKobo: number;
  currency?: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  return new Resend(apiKey);
}

export async function sendDisbursementFailedEmail({
  toEmail,
  amountKobo,
  currency = 'NGN',
}: SendDisbursementFailedEmailParams) {
  const resend = getResendClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;
  const disbursementsUrl = `${baseUrl}/dashboard/sponsor/disbursements`;
  const amountFormatted = formatCurrency(amountKobo / 100, currency);

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
      to: toEmail,
      subject: emailCopy.disbursementFailed.subject,
      react: DisbursementFailedEmail({
        disbursementsUrl,
        amountFormatted,
      }),
    });

    if (response.error) throw new Error(response.error.message);
    return response.data?.id ?? null;
  } catch (error) {
    captureException(error, {
      tags: { domain: 'lifecycle-emails', operation: 'send-disbursement-failed' },
      extra: { toEmail },
    });
    throw error;
  }
}
