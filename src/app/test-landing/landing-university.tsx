import { ShieldCheck, Database, Timer, Layers } from "lucide-react";
import { landingCopy as copy } from "@/config/copy/test-landing";
import { Reveal } from "./_shared";

const featureIcons = [ShieldCheck, Database, Timer, Layers];

export function University() {
  return (
    <section
      id="universities"
      className="bg-muted/40 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#4747D4]">
              {copy.universities.eyebrow}
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              {copy.universities.headline}{" "}
              <span className="text-[#4747D4]">
                {copy.universities.headlineAccent}
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-[17px]">
              {copy.universities.subtitle}
            </p>
          </div>
        </Reveal>

        {/* Feature grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 md:mt-16">
          {copy.universities.features.map((feature, i) => {
            const Icon = featureIcons[i];
            return (
              <Reveal key={feature.title} delay={i * 100}>
                <div className="flex gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-[#4747D4]/30 hover:shadow-md md:p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#000080]">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {feature.detail}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* University CTA */}
        <Reveal delay={200}>
          <div className="mt-12 flex flex-col items-center gap-3 text-center md:mt-14">
            <a
              href="/contact"
              className="inline-flex min-h-[52px] items-center gap-2 rounded-xl border border-[#000080] bg-[#000080] px-8 text-[15px] font-bold text-white transition-colors hover:bg-[#00006a]"
            >
              {copy.universities.cta}
            </a>
            <p className="text-[13px] text-muted-foreground">
              {copy.universities.ctaNote}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
