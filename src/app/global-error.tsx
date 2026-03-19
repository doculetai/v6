'use client';

import { captureException } from '@sentry/nextjs';
import { useEffect } from 'react';
import { commonErrors } from '@/config/copy/shared';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '16px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{commonErrors.globalError.heading}</h2>
          <p style={{ fontSize: '14px', color: '#666' }}>{commonErrors.globalError.body}</p>
          <button
            onClick={reset}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            {commonErrors.tryAgain}
          </button>
        </div>
      </body>
    </html>
  );
}
