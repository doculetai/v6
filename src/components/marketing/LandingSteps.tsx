import { landingCopy as copy } from '@/config/copy/landing';
import { LandingReveal } from './LandingReveal';

export function LandingSteps() {
  return (
    <section
      id="how-it-works"
      className="border-b border-border bg-[#F1F5F9] py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <LandingReveal>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {copy.steps.label}
          </p>
          <h2
            className="text-section-h2 font-serif font-semibold leading-tight tracking-tight text-[#2B39A3]"
          >
            {copy.steps.headline}
          </h2>
        </LandingReveal>

        <div className="mt-10">
          {copy.steps.items.map((step, i) => (
            <LandingReveal key={step.number} delay={i * 60}>
              <div className="group flex gap-6 border-t border-border py-5 transition-colors hover:bg-[rgba(43,57,163,0.02)]">
                <div className="w-10 shrink-0 pt-0.5">
                  <span className="font-mono text-[11px] font-semibold tracking-[0.05em] text-[rgba(43,57,163,0.4)]">
                    {step.number}
                  </span>
                </div>
                <div className="grid flex-1 gap-1 md:grid-cols-2 md:gap-4">
                  <h3 className="text-[17px] font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </div>
            </LandingReveal>
          ))}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  );
}
