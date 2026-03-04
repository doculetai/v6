import { Shield, CheckCircle2, Clock } from "lucide-react";
import { landingCopy as copy } from "@/config/copy/test-landing";
import { Reveal, CtaButtons } from "./_shared";

function CertificateMockup() {
  const cert = copy.certificate;
  return (
    <div className="relative">
      {/* Outer glow — radial gradient requires inline style */}
      <div
        className="pointer-events-none absolute -inset-4 rounded-3xl opacity-30"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, var(--accent) 0%, transparent 70%)",
        }}
      />

      {/* Certificate card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-primary shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
              {cert.badge}
            </span>
          </div>
          <span className="rounded-full bg-success/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-success">
            Valid
          </span>
        </div>

        {/* Certificate body */}
        <div className="px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
            {cert.title}
          </p>

          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-white">
              {cert.holder}
            </p>
            <p className="mt-0.5 text-sm text-white/60">
              {cert.institution}
            </p>
          </div>

          {/* Balance */}
          <div className="mt-5 rounded-xl bg-white/[0.06] px-4 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
              {cert.amountLabel}
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-white">
              {cert.amount}
            </p>
            <p className="mt-0.5 text-xs text-white/50">{cert.source}</p>
          </div>

          {/* Tier + seal */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
                Verification
              </p>
              <p className="mt-0.5 text-xs font-semibold text-accent">
                {cert.tier}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
                Expires
              </p>
              <p className="mt-0.5 text-xs font-semibold text-white/70">
                {cert.expires}
              </p>
            </div>
          </div>

          {/* Serial */}
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="text-center font-mono text-xs tracking-widest text-white/30">
              {cert.serial}
            </p>
          </div>
        </div>

        {/* Bottom seal strip */}
        <div className="flex items-center justify-center gap-2 border-t border-white/10 bg-white/[0.03] px-5 py-3">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
            {cert.status}
          </span>
        </div>
      </div>

      {/* Floating stat chip */}
      <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-lg">
        <Clock className="h-3.5 w-3.5 text-accent" />
        <span className="text-xs font-semibold text-foreground">
          Verified in 4 min
        </span>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="main-content"
      className="relative overflow-hidden bg-background pb-20 pt-28 md:pb-32 md:pt-44"
    >
      {/* Radial gradient — requires inline style for complex CSS function */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* Dot grid — requires inline style for backgroundImage pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--primary) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16 lg:gap-20">
          {/* Text column */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent opacity-80" />
                {copy.hero.eyebrow}
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="mt-6 font-serif text-5xl font-bold leading-[1.02] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                {copy.hero.headline}
                <br />
                <span className="text-accent">
                  {copy.hero.headlineAccent}
                </span>
              </h2>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                {copy.hero.subtitle}
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8">
                <CtaButtons
                  primary={copy.hero.ctaPrimary}
                  secondary={copy.hero.ctaSecondary}
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  {copy.hero.helper}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Certificate mockup */}
          <Reveal delay={200}>
            <CertificateMockup />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
