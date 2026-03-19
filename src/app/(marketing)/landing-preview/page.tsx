'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { commonUi } from '@/config/copy/shared';
import { landingCopy } from '@/config/copy/landing';
import { primitivesCopy } from '@/config/copy/primitives';
import { routes } from '@/config/routes';

const lc = landingCopy;
const cert = landingCopy.certificate;
const preview = landingCopy.preview;

// ── BRAND TOKENS ───────────────────────────────────────
// #2B39A3 = extracted from actual shield PNG pixels
// #2563EB = theme light.primary (interactive CTAs)
// #0A1628 = theme primary.950 (deep navy, dark sections only)
const C = {
  brand:   '#2B39A3',   // logo blue — headlines, brand marks
  cta:     '#2563EB',   // electric blue — buttons, links
  navy:    '#0A1628',   // deep navy — dark section bg only
  gold:    '#D4A853',   // trust/achievement accent
  bg:      '#F8FAFC',   // theme light.background
  bgAlt:   '#F1F5F9',   // theme light.secondary/muted
  white:   '#FFFFFF',
  ink:     '#0F172A',   // theme light.foreground
  muted:   '#475569',   // theme light.mutedForeground
  border:  '#E2E8F0',   // theme light.border
  success: '#16A34A',
} as const;

// ── COMPONENTS ─────────────────────────────────────────
function ShieldImg({ size, invert = false }: { size: number; invert?: boolean }) {
  // Pick closest asset size
  const assetSize = size <= 32 ? 32 : size <= 48 ? 40 : size <= 80 ? 64 : size <= 160 ? 120 : 200;
  return (
    <Image
      src={`/brand/assets/logo/doculet-shield-${assetSize}.png`}
      alt={primitivesCopy.brand.logoAlt}
      width={size}
      height={size}
      priority
      style={invert ? { filter: 'brightness(0) invert(1)' } : undefined}
    />
  );
}

function Check({ color = C.cta }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 4.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const steps = preview.steps.items;
const features = preview.certificate.features;

// ── PAGE ───────────────────────────────────────────────
export default function LandingPreviewPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", background: C.bg, color: C.ink }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Serif:ital,wght@0,300;0,400;0,600;1,400&display=swap');

        @keyframes cert-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cert-float, .pulse-dot { animation: none !important; }
        }
        .cert-float { animation: cert-float 6s ease-in-out infinite; }
        .pulse-dot  { animation: pulse-dot 2s ease-in-out infinite; }

        .step-row { border-top: 1px solid ${C.border}; transition: background 0.15s; }
        .step-row:last-of-type { border-bottom: 1px solid ${C.border}; }
        .step-row:hover { background: rgba(43,57,163,0.03); }

        .nav-link { color: ${C.muted}; font-size: 14px; transition: color 0.15s; text-decoration: none; }
        .nav-link:hover { color: ${C.brand}; }

        .ghost-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 12px 28px; border-radius: 9999px;
          border: 1px solid ${C.border}; color: ${C.muted};
          font-size: 15px; font-weight: 500;
          text-decoration: none; transition: background 0.15s, color 0.15s;
        }
        .ghost-btn:hover { background: rgba(43,57,163,0.05); color: ${C.brand}; border-color: rgba(43,57,163,0.3); }

        .primary-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 13px 32px; border-radius: 9999px;
          background: ${C.cta}; color: #fff;
          font-size: 15px; font-weight: 600;
          text-decoration: none; transition: opacity 0.15s;
        }
        .primary-btn:hover { opacity: 0.88; }
        .primary-btn-sm {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 10px 24px; border-radius: 9999px;
          background: ${C.cta}; color: #fff;
          font-size: 14px; font-weight: 600;
          text-decoration: none; transition: opacity 0.15s;
        }
        .primary-btn-sm:hover { opacity: 0.88; }

        .gold-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 13px 32px; border-radius: 9999px;
          background: ${C.gold}; color: ${C.navy};
          font-size: 15px; font-weight: 600;
          text-decoration: none; transition: filter 0.15s;
        }
        .gold-btn:hover { filter: brightness(1.08); }

        .mobile-overlay {
          position: fixed; inset: 0; z-index: 40;
          background: ${C.white};
          border-right: 1px solid ${C.border};
          display: flex; flex-direction: column;
          padding: 80px 32px 40px; gap: 0;
        }
        .mobile-overlay a {
          font-size: 22px; font-weight: 600;
          color: ${C.muted}; padding: 16px 0;
          border-bottom: 1px solid ${C.border};
          text-decoration: none; transition: color 0.15s;
        }
        .mobile-overlay a:hover { color: ${C.brand}; }

        .skip-link {
          position: absolute;
          left: -9999px;
          top: 0;
          z-index: 100;
          background: ${C.ink};
          color: ${C.white};
          padding: 10px 14px;
          border-radius: 0 0 10px 10px;
          font-size: 13px;
          text-decoration: none;
        }
        .skip-link:focus {
          left: 12px;
          top: 8px;
        }
      `}</style>

      <a href="#main-content" className="skip-link">{lc.nav.skipToContent}</a>

      {/* ── NAV ──────────────────────────────────────────── */}
      <nav
        style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-10"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <ShieldImg size={28} />
          <span style={{ fontFamily: "'IBM Plex Serif', serif", color: C.brand, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>
            {lc.nav.brandName}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="nav-link">{lc.nav.links[0].label}</Link>
          <Link href="#certificate" className="nav-link">{preview.nav.certificateLink}</Link>
          <Link href={routes.auth.login} className="nav-link">{lc.nav.signIn}</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href={routes.auth.signup} className="primary-btn-sm">{preview.nav.cta}</Link>
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(true)}
            aria-label={primitivesCopy.ariaExtended.openMenu}
          >
            <span className="flex flex-col gap-1.5">
              <span className="block w-5 h-0.5 rounded-full" style={{ background: C.ink }} />
              <span className="block w-5 h-0.5 rounded-full" style={{ background: C.ink }} />
              <span className="block w-3.5 h-0.5 rounded-full" style={{ background: C.ink }} />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-overlay md:hidden">
          <button
            onClick={() => setMenuOpen(false)}
            style={{ position: 'absolute', top: 20, right: 24, color: C.muted, fontSize: 14 }}
            aria-label={primitivesCopy.ariaExtended.closeMenu}
          >
            {commonUi.close}
          </button>
          <Link href="#how-it-works" onClick={() => setMenuOpen(false)}>{lc.nav.links[0].label}</Link>
          <Link href="#certificate" onClick={() => setMenuOpen(false)}>{preview.nav.certificateLink}</Link>
          <Link href={routes.auth.login} onClick={() => setMenuOpen(false)}>{lc.nav.signIn}</Link>
          <Link href={routes.auth.signup} onClick={() => setMenuOpen(false)} style={{ color: C.cta }}>
            {preview.nav.cta}
          </Link>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────── */}
      <main id="main-content">
      <section style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>

        {/* Brand-blue watermark — #2B39A3 on #F8FAFC = now actually visible */}
        <div
          style={{ position: 'absolute', right: -40, top: 56, opacity: 0.055, pointerEvents: 'none', zIndex: 0 }}
          aria-hidden="true"
        >
          <ShieldImg size={500} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center min-h-[72vh] py-14 md:py-16">

            {/* Left: headline */}
            <div className="space-y-8 max-w-xl">

              {/* Eyebrow */}
              <div
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontSize: 12, fontWeight: 500, letterSpacing: '0.02em',
                  padding: '6px 14px', borderRadius: 9999,
                  background: 'rgba(43,57,163,0.08)',
                  color: C.brand,
                  border: '1px solid rgba(43,57,163,0.2)',
                }}
              >
                <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: C.brand, display: 'inline-block' }} />
                {preview.hero.eyebrow}
              </div>

              {/* Size-contrast headline — brand blue on headline */}
              <div>
                <p style={{
                  fontFamily: "'IBM Plex Serif', serif",
                  fontSize: 'clamp(72px, 9vw, 112px)',
                  fontWeight: 600,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: C.brand,   // ← logo blue, not near-black
                  margin: 0,
                }}>
                  {preview.hero.headline}
                </p>
                <p style={{
                  fontFamily: "'IBM Plex Serif', serif",
                  fontSize: 'clamp(20px, 2.5vw, 28px)',
                  fontWeight: 300,
                  lineHeight: 1.45,
                  color: C.muted,
                  marginTop: 16,
                }}>
                  {preview.hero.sub.split('\n').map((line, i) => (
                    <span key={i}>{i > 0 && <br />}{line}</span>
                  ))}
                </p>
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href={routes.auth.signup} className="primary-btn">{preview.hero.ctaPrimary}</Link>
                <Link href="#how-it-works" className="ghost-btn">{preview.hero.ctaSecondary}</Link>
              </div>

              {/* Warmth / trust signal inline — critique fix */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(43,57,163,0.08)', color: C.brand,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, flexShrink: 0,
                }}>
                  {preview.hero.quoteInitials}
                </div>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.5, margin: 0 }}>
                  <em style={{ color: C.ink, fontStyle: 'italic' }}>
                    {preview.hero.quote}
                  </em>
                  {' '}{preview.hero.quoteAttribution}
                </p>
              </div>
            </div>

            {/* Right: floating certificate */}
            <div className="hidden md:block">
              <div className="cert-float">
                <CertificateCard />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile certificate */}
        <div className="md:hidden flex justify-center px-6 pb-14">
          <div style={{ width: '100%', maxWidth: 340 }}>
            <CertificateCard />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}` }}
        className="py-14 md:py-16"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
              {preview.steps.sectionLabel}
            </p>
            <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 'clamp(32px,4vw,48px)', fontWeight: 600, lineHeight: 1.1, color: C.brand, margin: 0 }}>
              {preview.steps.headline.split('\n').map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </h2>
          </div>

          <div>
            {steps.map((step) => (
              <div key={step.num} className="step-row" style={{ display: 'flex', gap: 24, padding: '18px 0', alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, flexShrink: 0,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
                  color: 'rgba(43,57,163,0.4)',  // ← audit fix: was 0.2, now 0.4 — readable
                  paddingTop: 2,
                }}>
                  {step.num}
                </div>
                <div className="flex-1 grid gap-2 md:grid-cols-2 md:gap-3">
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: C.ink, margin: 0 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, margin: 0 }}>{step.body}</p>
                </div>
              </div>
            ))}
            <div style={{ borderBottom: `1px solid ${C.border}` }} />
          </div>
        </div>
      </section>

      {/* ── CERTIFICATE SECTION ──────────────────────────── */}
      <section
        id="certificate"
        style={{ background: C.navy, borderTop: `4px solid ${C.gold}` }}
        className="py-14 md:py-16"
      >
        <div className="mx-auto max-w-4xl px-6 md:px-10">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,168,83,0.6)', margin: 0 }}>
                {preview.certificate.sectionLabel}
              </p>
              <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 'clamp(32px,4vw,48px)', fontWeight: 600, lineHeight: 1.1, color: '#fff', margin: 0 }}>
                {preview.certificate.headline.split('\n').map((line, i) => (
                  <span key={i}>{i > 0 && <br />}{line}</span>
                ))}
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, margin: 0 }}>
                {preview.certificate.body}
              </p>

              <ul className="grid gap-2 md:grid-cols-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.45 }}>
                    <span style={{ color: C.gold }}><Check color={C.gold} /></span>
                    {f}
                  </li>
                ))}
              </ul>

              <div>
                <Link href={routes.auth.signup} className="gold-btn" style={{ width: 'fit-content' }}>
                  {preview.certificate.cta}
                </Link>
              </div>
          </div>
        </div>
      </section>

      </main>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}` }} className="py-14 md:py-16">
        <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: '100%',
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              background: C.white,
              padding: '12px 14px',
              textAlign: 'left',
            }}
          >
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: C.muted }}>
              <em style={{ color: C.ink, fontStyle: 'italic' }}>
                {preview.hero.finalQuote}
              </em>
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: C.brand, fontWeight: 600 }}>
              {preview.hero.finalQuoteAttribution}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href={routes.auth.signup} className="primary-btn">{lc.cta.ctaPrimary}</Link>
            <Link href={routes.auth.login} className="ghost-btn">{lc.cta.ctaSecondary}</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ background: C.white, borderTop: `1px solid ${C.border}` }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20,
          padding: '14px 24px', borderBottom: `1px solid ${C.border}`,
          fontSize: 12, color: C.muted,
        }}>
          {preview.footer.trustMarkers.map(item => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.muted }}>
            <ShieldImg size={16} />
            {preview.footer.copyright}
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 12, color: C.muted }}>
            {preview.footer.links.map(({ label, href }) => (
              <Link key={href} href={href} style={{ color: C.muted, textDecoration: 'none' }}
                onMouseOver={e => (e.currentTarget.style.color = C.brand)}
                onMouseOut={e => (e.currentTarget.style.color = C.muted)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── CERTIFICATE CARD — hero ────────────────────────────
function CertificateCard() {
  return (
    <div style={{
      width: 320, background: C.white,
      border: `1px solid ${C.border}`, borderRadius: 14,
      boxShadow: '0 20px 40px rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.06)',
      overflow: 'hidden', color: C.ink,
    }}>
      {/* Brand-blue top stripe instead of gradient — logo blue */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${C.brand}, ${C.cta})` }} />
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 2 }}>
              {cert.badge}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'IBM Plex Serif', serif", color: C.brand }}>
              {cert.brand}
            </div>
          </div>
          <ShieldImg size={24} />
        </div>

        <div style={{ height: 1, background: `rgba(43,57,163,0.12)`, marginBottom: 14 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 2 }}>{cert.holderLabel}</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{cert.holder}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 2 }}>{cert.balanceLabel}</div>
              <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace" }}>$45,200 USD</div>
            </div>
            <div>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 2 }}>{cert.institutionLabel}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{cert.institution}</div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: C.border, marginBottom: 12 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 9999, background: 'rgba(22,163,74,0.1)', color: C.success }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            VERIFIED
          </div>
          <div style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: C.muted }}>{cert.serial}</div>
        </div>
      </div>
    </div>
  );
}
