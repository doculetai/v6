// design-lint-ignore: email templates require inline styles — email clients (Gmail, Outlook)
// strip external stylesheets and CSS classes. Inline styles here are intentional and required.
// The <a> tag is also intentional — next/link cannot be used in email HTML.
import * as React from 'react';

import { emailCopy } from '@/config/copy/email';

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

const universityStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  marginBottom: '24px',
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

type UniversityImportEmailProps = {
  signupUrl: string;
  universityName: string;
};

export function UniversityImportEmail({
  signupUrl,
  universityName,
}: UniversityImportEmailProps) {
  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>{emailCopy.universityImport.heading}</h1>
        <p style={bodyStyle}>{emailCopy.universityImport.body}</p>
        <p style={universityStyle}>
          Invited by: <strong>{universityName}</strong>
        </p>
        <a href={signupUrl} style={ctaStyle}>
          {emailCopy.universityImport.ctaLabel}
        </a>
        <p style={footerStyle}>{emailCopy.universityImport.footer}</p>
      </div>
    </div>
  );
}
