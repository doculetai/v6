import { captureException } from '@sentry/nextjs';
import { Resend } from 'resend';

import { emailCopy } from '@/config/copy/email';

import { DocumentStatusEmail } from './templates/document-status-email';

const DEFAULT_FROM_EMAIL = 'Doculet <noreply@doculet.ai>';
const DEFAULT_APP_URL = 'https://app.doculet.ai';

type DocumentStatus = 'approved' | 'rejected' | 'more_info_requested';

type SendDocumentStatusEmailParams = {
  toEmail: string;
  status: DocumentStatus;
  reason?: string | null;
};

type DocumentStatusCopy =
  | (typeof emailCopy)['documentApproved']
  | (typeof emailCopy)['documentRejected']
  | (typeof emailCopy)['documentMoreInfoRequested'];

const COPY_BY_STATUS: Record<DocumentStatus, DocumentStatusCopy> = {
  approved: emailCopy.documentApproved,
  rejected: emailCopy.documentRejected,
  more_info_requested: emailCopy.documentMoreInfoRequested,
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  return new Resend(apiKey);
}

export async function sendDocumentStatusEmail({
  toEmail,
  status,
  reason,
}: SendDocumentStatusEmailParams) {
  const resend = getResendClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;
  const documentsUrl = `${baseUrl}/dashboard/student/documents`;
  const copy = COPY_BY_STATUS[status];

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
      to: toEmail,
      subject: copy.subject,
      react: DocumentStatusEmail({
        copy,
        documentsUrl,
        reason: status !== 'approved' ? reason : null,
      }),
    });

    if (response.error) throw new Error(response.error.message);
    return response.data?.id ?? null;
  } catch (error) {
    captureException(error, {
      tags: { domain: 'lifecycle-emails', operation: 'send-document-status' },
      extra: { toEmail, status },
    });
    throw error;
  }
}
