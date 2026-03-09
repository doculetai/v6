'use client';

import { captureException } from '@sentry/nextjs';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { PageHeader, PageShell, Section } from '@/components/layout/content-primitives';
import { commonErrors } from '@/config/copy/shared';

export default function SupportError({
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
    <PageShell>
      <Section>
        <PageHeader
          title={commonErrors.generic}
          description={commonErrors.pageLoadFailed}
        />
        <Button variant="outline" onClick={reset} className="min-h-[44px]">
          {commonErrors.tryAgain}
        </Button>
      </Section>
    </PageShell>
  );
}
