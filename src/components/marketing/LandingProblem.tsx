import { landingCopy as copy } from '@/config/copy/landing';
import { LandingReveal } from './LandingReveal';

export function LandingProblem() {
  return (
    <section className="border-b border-border bg-[#F8FAFC] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <LandingReveal>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {copy.problem.label}
          </p>
          <h2
            className="max-w-2xl text-section-h2 font-serif font-semibold leading-tight tracking-tight text-[#2B39A3]"
          >
            {copy.problem.headline}{' '}
            <span className="text-foreground">{copy.problem.headlineAccent}</span>
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            {copy.problem.body}
          </p>
        </LandingReveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {copy.problem.cards.map((card, i) => (
            <LandingReveal key={card.title} delay={i * 100}>
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <p className="font-mono text-2xl font-bold text-[#2B39A3]">{card.stat}</p>
                <h3 className="mt-3 text-base font-semibold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {card.detail}
                </p>
              </div>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
