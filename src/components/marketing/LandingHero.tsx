import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { landingCopy as copy } from '@/config/copy/landing';
import { routes } from '@/config/routes';
import { LandingReveal } from './LandingReveal';
import { CertificateCard } from './LandingCertificateMockup';

export function LandingHero() {
  return (
    <section
      id="main-content"
      className="relative overflow-hidden border-b border-border bg-[#F8FAFC]"
    >
      <div className="pointer-events-none absolute -right-10 top-14 h-[500px] w-[500px] rounded-full bg-[#2B39A3] opacity-[0.04]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid min-h-[72vh] items-center gap-10 py-14 md:grid-cols-[1fr_auto] md:py-16">

          <div className="max-w-xl space-y-8">
            <LandingReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(43,57,163,0.2)] bg-[rgba(43,57,163,0.06)] px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#2B39A3]">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#2B39A3]" />
                {copy.hero.eyebrow}
              </div>
            </LandingReveal>

            <LandingReveal delay={80}>
              <div>
                <p
                  className="font-serif font-semibold leading-none tracking-[-0.02em] text-[#2B39A3]"
                  style={{ fontSize: 'clamp(64px, 9vw, 112px)' }}
                >
                  {copy.hero.headline}
                </p>
                <p
                  className="mt-4 font-serif font-light leading-snug text-muted-foreground"
                  style={{ fontSize: 'clamp(18px, 2.5vw, 26px)' }}
                >
                  {copy.hero.sub}
                </p>
              </div>
            </LandingReveal>

            <LandingReveal delay={160}>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-7 py-3">
                  <Link href={routes.auth.signup}>
                    {copy.hero.ctaPrimary}
                    <ArrowRight weight="duotone" size={16} className="ml-1.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-7 py-3">
                  <Link href={copy.hero.ctaSecondaryHref}>{copy.hero.ctaSecondary}</Link>
                </Button>
              </div>
            </LandingReveal>

            <LandingReveal delay={240}>
              <div className="flex items-center gap-3 border-t border-border pt-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(43,57,163,0.08)] text-xs font-semibold text-[#2B39A3]">
                  {copy.hero.quoteInitials}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <em className="not-italic text-foreground">&ldquo;{copy.hero.quote}&rdquo;</em>
                  {' '}— {copy.hero.quoteAttribution}
                </p>
              </div>
            </LandingReveal>
          </div>

          <div className="hidden md:block">
            <div className="animate-[cert-float_6s_ease-in-out_infinite] motion-reduce:animate-none">
              <CertificateCard />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center px-6 pb-14 md:hidden">
        <CertificateCard className="w-full max-w-sm" />
      </div>
    </section>
  );
}
