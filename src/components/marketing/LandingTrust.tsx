import Link from 'next/link';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr';
import { landingCopy as copy } from '@/config/copy/landing';
import { routes } from '@/config/routes';
import { LandingReveal } from './LandingReveal';
import { CertificateFull } from './LandingCertificateMockup';

export function LandingTrust() {
  return (
    <section
      id="the-seal"
      className="border-t-4 border-[#D4A853] bg-[#0A1628] py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_1.1fr]">
          <LandingReveal>
            <div className="flex flex-col gap-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(212,168,83,0.6)]">
                {copy.trust.label}
              </p>
              <h2
                className="text-section-h2 font-serif font-semibold leading-tight tracking-tight text-white"
              >
                {copy.trust.headline}
              </h2>
              <p className="text-[15px] leading-relaxed text-white/50">
                {copy.trust.body}
              </p>
              <ul className="flex flex-col gap-2.5">
                {copy.trust.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-white/60">
                    <CheckCircle weight="duotone" size={14} className="shrink-0 text-[#D4A853]" />
                    {feat}
                  </li>
                ))}
              </ul>
              <div>
                <Link
                  href={routes.auth.signup}
                  className="inline-flex items-center justify-center rounded-full bg-[#D4A853] px-7 py-3 text-sm font-semibold text-[#0A1628] transition-[filter] hover:brightness-110"
                >
                  {copy.trust.cta}
                </Link>
              </div>
            </div>
          </LandingReveal>

          <LandingReveal delay={120}>
            <div className="flex justify-center md:justify-end">
              <CertificateFull />
            </div>
          </LandingReveal>
        </div>
      </div>
    </section>
  );
}
