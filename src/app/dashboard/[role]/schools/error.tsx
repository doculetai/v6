'use client';

import { ErrorState } from '@/components/ui/error-state';

export default function SchoolsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      heading="Failed to load schools"
      body={error.message}
      action={{ label: 'Try again', onClick: reset }}
    />
  );
}
