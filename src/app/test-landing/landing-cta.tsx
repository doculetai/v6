import { Check } from "lucide-react";
import { landingCopy as copy } from "@/config/copy/test-landing";
import { Reveal, CtaButtons } from "./_shared";

export function FinalCta() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-primary py-20 md:py-28"
    >
      {/* Single subtle glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-80 w-full max-w-4xl -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 text-center md:px-8">
        <Reveal>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white md:text-5xl">
            {copy.cta.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/70">
            {copy.cta.subtitle}
          </p>

          <div className="mt-8 flex justify-center">
            <CtaButtons
              primary={copy.cta.ctaPrimary}
              secondary={copy.cta.ctaSecondary}
              variant="dark"
            />
          </div>
        </Reveal>

        {/* Trust markers */}
        <Reveal delay={200}>
          <div className="mx-auto mt-12 flex max-w-xl flex-wrap items-center justify-center gap-x-4 gap-y-3">
            {copy.trustMarkers.map((text) => (
              <span
                key={text}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white/60"
              >
                <Check className="h-3 w-3 text-success" />
                {text}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
