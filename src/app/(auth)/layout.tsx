import Image from 'next/image';
import Link from 'next/link';

import { authCopy } from '@/config/copy/auth';
import { routes } from '@/config/routes';
import { cn } from '@/lib/utils';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'relative min-h-screen overflow-x-hidden text-foreground',
        'bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,#1e293b_0%,#0b1220_55%,#0b1220_100%)]',
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(circle_at_25%_20%,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(15,23,42,0.14),transparent_35%)]" />
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-[1fr_440px] lg:px-10">
        <aside className="hidden rounded-3xl border border-primary/15 bg-primary p-10 text-primary-foreground shadow-2xl lg:flex lg:min-h-[620px] lg:flex-col lg:justify-between">
          <Link href={routes.marketing.landing} className="inline-flex w-fit items-center gap-3">
            <Image
              src="/brand/logos/logo-light.svg"
              alt={authCopy.brandAlt}
              width={170}
              height={44}
              priority
              className="h-auto w-44"
            />
          </Link>
          <div>
            <p className="font-serif text-4xl leading-tight tracking-tight text-white/95">
              {authCopy.login.heroTagline}
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/70">
              {authCopy.login.heroSub}
            </p>
          </div>
          <div className="grid gap-3 text-xs text-primary-foreground/70">
            {authCopy.layoutTrust.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </aside>
        <div className="mx-auto w-full max-w-md">
          <Link href={routes.marketing.landing} className="mb-7 inline-flex items-center gap-3 lg:hidden">
            <Image
              src="/brand/logos/logo.svg"
              alt={authCopy.brandAlt}
              width={170}
              height={44}
              priority
              className="h-auto w-44"
            />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
