// design-lint-ignore: email templates require inline styles
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

const reasonStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '16px',
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
  marginTop: '16px',
};

const footerStyle: React.CSSProperties = {
  marginTop: '24px',
  fontSize: '12px',
  color: '#4b5563',
  lineHeight: '18px',
};

type DocumentStatusEmailProps = {
  copy: (typeof emailCopy)['documentApproved'] | (typeof emailCopy)['documentRejected'] | (typeof emailCopy)['documentMoreInfoRequested'];
  documentsUrl: string;
  reason?: string | null;
};

export function DocumentStatusEmail({
  copy,
  documentsUrl,
  reason,
}: DocumentStatusEmailProps) {
  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>{copy.heading}</h1>
        <p style={bodyStyle}>{copy.body}</p>
        {reason ? <div style={reasonStyle}>{reason}</div> : null}
        <a href={documentsUrl} style={ctaStyle}>
          {copy.ctaLabel}
        </a>
        <p style={footerStyle}>{copy.footer}</p>
      </div>
    </div>
  );
}
