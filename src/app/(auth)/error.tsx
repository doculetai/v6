'use client';

import { Warning } from '@/components/icons';
import { captureException } from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { authCopy } from '@/config/copy/auth';
import { commonErrors } from '@/config/copy/shared';
import { routes } from '@/config/routes';

export default function AuthError({
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
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4 text-center">
      <Warning weight="duotone" className="size-10 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{commonErrors.generic}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={reset} className="min-h-11">
          {commonErrors.tryAgain}
        </Button>
        <Button variant="ghost" asChild className="min-h-11">
          <Link href={routes.auth.login}>{authCopy.error.backToLogin}</Link>
        </Button>
      </div>
    </div>
  );
}
