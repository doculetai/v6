'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { authCopy } from '@/config/copy/auth';
import { browserTrpcClient } from '@/trpc/client';

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

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <a
          href={authCopy.routes.login}
          className="text-primary hover:underline"
        >
          Return to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      <p className="text-muted-foreground">Finishing sign-in...</p>
    </div>
  );
}
