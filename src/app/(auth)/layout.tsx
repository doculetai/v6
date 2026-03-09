import Image from 'next/image';
import Link from 'next/link';

import { Certificate, SealCheck, ShieldCheck } from '@/components/icons';
import { authCopy } from '@/config/copy/auth';
import { routes } from '@/config/routes';

const trustIndicators = [
  { icon: SealCheck, label: authCopy.layoutTrust[0] },
  { icon: ShieldCheck, label: authCopy.layoutTrust[1] },
  { icon: Certificate, label: authCopy.layoutTrust[2] },
] as const;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-[1fr_440px] lg:px-10">
        {/* Desktop sidebar */}
        <aside
          className="hidden rounded-3xl bg-foreground p-10 text-white shadow-2xl lg:flex lg:min-h-[620px] lg:flex-col lg:items-center lg:justify-center"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            <Link href={routes.marketing.landing} className="inline-flex">
              <Image
                src="/brand/assets/logo/doculet-shield-200.png"
                alt={authCopy.brandAlt}
                width={200}
                height={200}
                priority
                className="size-[120px] shrink-0 brightness-0 invert drop-shadow-[0_0_48px_rgba(255,255,255,0.2)]"
              />
            </Link>
            <p className="max-w-xs text-center font-serif text-2xl leading-snug text-white/90">
              {authCopy.login.heroTagline}
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mt-auto flex items-center gap-6">
            {trustIndicators.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-xs text-white/40">
                <Icon className="size-5 shrink-0" weight="duotone" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </aside>

        {/* Form column */}
        <div className="mx-auto w-full max-w-md">
          {/* Mobile brand header */}
          <div className="mb-7 flex flex-col items-center gap-3 lg:hidden">
            <div className="h-1.5 w-12 rounded-full bg-primary" />
            <Link href={routes.marketing.landing} className="inline-flex items-center gap-2.5">
              <Image
                src="/brand/assets/logo/doculet-shield-80.png"
                alt=""
                width={80}
                height={80}
                priority
                className="size-10 shrink-0"
                aria-hidden="true"
              />
              <span className="font-serif text-base font-semibold tracking-[-0.01em] text-primary">
                Doculet
              </span>
            </Link>
            <p className="text-center text-sm text-muted-foreground">
              {authCopy.login.heroTagline}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
