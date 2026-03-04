import { landingCopy as copy } from "@/config/copy/test-landing";
import { Reveal } from "./_shared";

export function Steps() {
  return (
    <section
      id="how-it-works"
      className="relative bg-background py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-accent">
              {copy.steps.eyebrow}
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              {copy.steps.headline}{" "}
              <span className="text-muted-foreground">
                {copy.steps.headlineAccent}
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-16 md:mt-20">
          <div className="relative">
            {/* Connector line — desktop. Requires inline style for dashed background pattern */}
            <div
              className="pointer-events-none absolute left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] top-6 hidden h-px md:block"
              aria-hidden="true"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 4px, var(--border) 4px, var(--border) 12px)",
              }}
            />

            <div className="grid gap-8 md:grid-cols-4 md:gap-0">
              {copy.steps.items.map((step, i) => (
                <Reveal key={step.number} delay={i * 120}>
                  <div className="relative md:px-6">
                    {/* Step number bubble */}
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground ring-4 ring-primary/10">
                      {step.number}
                    </div>

                    <h3 className="mt-5 text-base font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
