import * as React from 'react';

import { emailCopy } from '@/config/copy/email';

// Email clients require inline styles — these constants keep styles out of JSX literals
const wrapperStyle: React.CSSProperties = {
  fontFamily: 'IBM Plex Sans, Arial, sans-serif',
  backgroundColor: '#f4f4f5',
  color: '#111827',
  padding: '24px',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  maxWidth: '560px',
  margin: '0 auto',
  padding: '24px',
  border: '1px solid #e5e7eb',
};

const headingStyle: React.CSSProperties = {
  marginTop: 0,
  fontSize: '24px',
  lineHeight: '32px',
};

const bodyStyle: React.CSSProperties = { fontSize: '16px', lineHeight: '24px' };

const invitedByStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  marginBottom: '24px',
};

const noteStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  marginBottom: '24px',
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  backgroundColor: '#f9fafb',
};

const ctaStyle: React.CSSProperties = {
  display: 'inline-block',
  textDecoration: 'none',
  backgroundColor: '#111827',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '12px 16px',
  fontWeight: 600,
};

const footerStyle: React.CSSProperties = {
  marginTop: '24px',
  fontSize: '12px',
  color: '#4b5563',
  lineHeight: '18px',
};

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
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>{emailCopy.sponsorInvitation.heading}</h1>
        <p style={bodyStyle}>{emailCopy.sponsorInvitation.body}</p>
        <p style={invitedByStyle}>
          Invited by: <strong>{studentEmail}</strong>
        </p>
        {note ? <div style={noteStyle}>{note}</div> : null}
        <a href={dashboardUrl} style={ctaStyle}>
          {emailCopy.sponsorInvitation.ctaLabel}
        </a>
        <p style={footerStyle}>{emailCopy.sponsorInvitation.footer}</p>
      </div>
    </div>
  );
}
