import * as React from 'react';

import { emailCopy } from '@/config/copy/email';

type SponsorInvitationEmailProps = {
  dashboardUrl: string;
  studentEmail: string;
  note?: string | null;
};

export function SponsorInvitationEmail({
  dashboardUrl,
  studentEmail,
  note,
}: SponsorInvitationEmailProps) {
  return (
    <div
      style={{
        fontFamily: 'IBM Plex Sans, Arial, sans-serif',
        backgroundColor: '#f4f4f5',
        color: '#111827',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          maxWidth: '560px',
          margin: '0 auto',
          padding: '24px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h1 style={{ marginTop: 0, fontSize: '24px', lineHeight: '32px' }}>
          {emailCopy.sponsorInvitation.heading}
        </h1>
        <p style={{ fontSize: '16px', lineHeight: '24px' }}>{emailCopy.sponsorInvitation.body}</p>
        <p style={{ fontSize: '14px', lineHeight: '22px', marginBottom: '24px' }}>
          Invited by: <strong>{studentEmail}</strong>
        </p>
        {note ? (
          <div
            style={{
              fontSize: '14px',
              lineHeight: '22px',
              marginBottom: '24px',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
            }}
          >
            {note}
          </div>
        ) : null}
        <a
          href={dashboardUrl}
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            backgroundColor: '#111827',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontWeight: 600,
          }}
        >
          {emailCopy.sponsorInvitation.ctaLabel}
        </a>
        <p style={{ marginTop: '24px', fontSize: '12px', color: '#4b5563', lineHeight: '18px' }}>
          {emailCopy.sponsorInvitation.footer}
        </p>
      </div>
    </div>
  );
}
