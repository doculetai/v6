import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { landingCopy as copy } from '@/config/copy/landing';
import { routes } from '@/config/routes';

export function LandingCta() {
  return (
    <section className="border-b border-border bg-[#F1F5F9] py-16 md:py-20">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 text-center">
        <Image
          src="/brand/assets/logo/doculet-shield-48.png"
          alt="Doculet"
          width={48}
          height={48}
        />
        <h2
          className="text-cta-h2 font-serif font-semibold leading-tight tracking-tight text-[#2B39A3]"
        >
          {copy.cta.headline}
        </h2>
        <p className="text-[15px] text-muted-foreground">{copy.cta.body}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full px-7 py-3">
            <Link href={routes.auth.signup}>{copy.cta.ctaPrimary}</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-7 py-3">
            <Link href={routes.auth.login}>{copy.cta.ctaSecondary}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
