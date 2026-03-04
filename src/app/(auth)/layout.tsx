import Image from 'next/image';

import { authCopy } from '@/config/copy/auth';
import { cn } from '@/lib/utils';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'relative flex min-h-screen items-center justify-center overflow-x-hidden bg-background px-4 py-10 text-foreground',
        'bg-gradient-to-b from-background via-background to-muted',
      )}
    >
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        <Image
          src="/brand/logos/logo.svg"
          alt={authCopy.brandAlt}
          width={170}
          height={44}
          priority
          className="h-auto w-[170px]"
        />
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
