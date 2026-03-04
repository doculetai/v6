import { FileWarning, PhoneOff, FileX } from "lucide-react";
import { landingCopy as copy } from "@/config/copy/test-landing";
import { Reveal } from "./_shared";

const icons = [FileWarning, PhoneOff, FileX];

export function Problem() {
  return (
    <section className="relative overflow-hidden bg-primary py-20 md:py-28">
      {/* Radial glow — requires inline style for complex CSS gradient */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-96 w-full max-w-4xl -translate-x-1/2 -translate-y-1/4 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-white md:text-5xl">
              {copy.problem.headline}{" "}
              <span className="text-accent">{copy.problem.headlineAccent}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 md:mt-6">
              {copy.problem.body}
            </p>
          </div>
        </Reveal>

        {/* Pain-point cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-3 md:mt-16">
          {copy.problem.cards.map((card, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={card.title} delay={i * 120}>
                <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.07] md:p-8">
                  {/* Top accent line */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  {/* Watermark stat */}
                  <div className="absolute bottom-4 right-5 font-serif text-4xl font-bold leading-none text-white/[0.05] md:right-6 md:text-5xl">
                    {card.stat}
                  </div>

                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/[0.08]">
                      <Icon className="h-5 w-5 text-white/90" />
                    </div>
                    <h3 className="mt-5 text-base font-bold text-white">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {card.detail}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
