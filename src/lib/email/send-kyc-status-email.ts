import { captureException } from '@sentry/nextjs';
import { Resend } from 'resend';

import { emailCopy } from '@/config/copy/email';

import { KycStatusEmail } from './templates/kyc-status-email';

const DEFAULT_FROM_EMAIL = 'Doculet <noreply@doculet.ai>';
const DEFAULT_APP_URL = 'https://app.doculet.ai';

type KycStatus = 'verified' | 'failed';

type SendKycStatusEmailParams = {
  toEmail: string;
  status: KycStatus;
  failureReason?: string | null;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  return new Resend(apiKey);
}

export async function sendKycStatusEmail({
  toEmail,
  status,
  failureReason,
}: SendKycStatusEmailParams) {
  const resend = getResendClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;
  const verificationUrl = `${baseUrl}/dashboard/student/verification`;
  const copy = status === 'verified' ? emailCopy.kycVerified : emailCopy.kycFailed;

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
      to: toEmail,
      subject: copy.subject,
      react: KycStatusEmail({ status, verificationUrl, failureReason }),
    });

    if (response.error) throw new Error(response.error.message);
    return response.data?.id ?? null;
  } catch (error) {
    captureException(error, {
      tags: { domain: 'lifecycle-emails', operation: 'send-kyc-status' },
      extra: { toEmail, status },
    });
    throw error;
  }
}
