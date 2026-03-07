import { FileDashed, PhoneSlash, Warning } from '@/components/icons';
import { landingCopy as copy } from '@/config/copy/landing';
import { LandingReveal } from './LandingReveal';

const ICONS = [FileDashed, PhoneSlash, Warning] as const;

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
          {copy.problem.cards.map((card, i) => {
            const Icon = ICONS[i];
            return (
              <LandingReveal key={card.title} delay={i * 100}>
                <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <p
                    className="absolute bottom-4 right-5 text-stat-watermark font-mono font-bold leading-none text-muted-foreground/10"
                    aria-hidden="true"
                  >
                    {card.stat}
                  </p>
                  <div className="relative">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(43,57,163,0.08)]">
                      <Icon weight="duotone" size={20} className="text-[#2B39A3]" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {card.detail}
                    </p>
                  </div>
                </div>
              </LandingReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
