import Link from 'next/link';
import { ArrowRight } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { landingCopy as copy } from '@/config/copy/landing';
import { routes } from '@/config/routes';
import { LandingReveal } from './LandingReveal';
import { CertificateCard } from './LandingCertificateMockup';

export function LandingHero() {
  return (
    <section
      className="relative overflow-hidden border-b border-border bg-background"
    >
      <div className="pointer-events-none absolute -right-10 top-14 h-[500px] w-[500px] rounded-full bg-primary opacity-[0.04]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid min-h-[72vh] items-center gap-10 py-14 md:grid-cols-[1fr_auto] md:py-16">

          <div className="max-w-xl space-y-8">
            <LandingReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3.5 py-1.5 text-xs font-medium tracking-wide text-primary">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                {copy.hero.eyebrow}
              </div>
            </LandingReveal>

            <LandingReveal delay={80}>
              <div>
                <p
                  className="text-hero-h1 font-serif font-semibold leading-none tracking-[-0.02em] text-primary"
                >
                  {copy.hero.headline}
                </p>
                <p
                  className="mt-4 text-hero-sub font-serif font-light leading-snug text-muted-foreground"
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
              <div className="flex flex-wrap gap-8 border-t border-border pt-6">
                {copy.hero.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-mono text-xl font-semibold text-foreground">{stat.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </LandingReveal>

            <LandingReveal delay={300}>
              <figure className="rounded-xl border border-border bg-card px-5 py-4">
                <blockquote className="text-sm leading-relaxed text-muted-foreground">
                  <span className="text-primary">&ldquo;</span>{copy.hero.quote}<span className="text-primary">&rdquo;</span>
                </blockquote>
                <figcaption className="mt-3 flex items-center gap-2.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-semibold text-primary">
                    {copy.hero.quoteInitials}
                  </span>
                  <span className="text-xs text-muted-foreground">{copy.hero.quoteAttribution}</span>
                </figcaption>
              </figure>
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
