'use client';

import { CircleNotch } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { authCopy } from '@/config/copy/auth';
import { browserTrpcClient } from '@/trpc/client';
import { routes } from '@/config/routes';

export default function AuthCompletePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await browserTrpcClient.student.ensureProfile.mutate();
        const profile = await browserTrpcClient.student.getCurrentProfile.query();
        if (!cancelled) {
          router.replace(`/dashboard/${profile.role}`);
        }
      } catch {
        if (!cancelled) {
          setError(authCopy.login.genericError);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h1 className="sr-only">{authCopy.complete.heading}</h1>
      {error ? (
        <>
          <p className="text-destructive">{error}</p>
          <a
            href={authCopy.routes.login}
            className="text-primary hover:underline"
          >
            {authCopy.complete.returnToSignIn}
          </a>
        </>
      ) : (
        <>
          <CircleNotch weight="bold" className="size-8 animate-spin text-primary" aria-hidden />
          <p className="text-muted-foreground">{authCopy.complete.loadingText}</p>
        </>
      )}
    </div>
  );
}
