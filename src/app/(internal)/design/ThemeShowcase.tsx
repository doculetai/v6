'use client';

import {
  borderTokens,
  chartTokens,
  colorScales,
  radiusTokens,
  roleAccents,
  semanticTokens,
  shadowTokens,
  sidebarTokens,
  typographyScale,
} from './_tokens';
import { Code, Section, SectionDivider } from './_helpers';
import { designLabCopy as c } from '@/config/copy/design-lab';

function Swatch({ cssVar, label, size = 'md' }: { cssVar: string; label: string; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 'h-8' : 'h-12';
  return (
    <div className="space-y-1">
      <div
        className={`${h} w-full rounded-sm border border-border/40`}
        style={{ backgroundColor: `var(--${cssVar})` } as React.CSSProperties}
      />
      <p className="truncate font-mono text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

// ── COLORS ──────────────────────────────────────────────────────────
export function ColorsShowcase() {
  return (
    <Section id="colors" title={c.sections.colors}>
      <div className="space-y-8">
        {/* Color Scales — horizontal gradient strips */}
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Palette Scales
          </p>
          {colorScales.map((scale) => (
            <div key={scale.name} className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">{scale.name}</p>
              <div className="flex overflow-hidden rounded-lg border border-border/40">
                {scale.stops.map((stop) => (
                  <div
                    key={stop}
                    className="group relative h-10 flex-1"
                    style={{
                      backgroundColor: `var(--color-${scale.prefix}-${stop})`,
                    } as React.CSSProperties}
                  >
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] opacity-0 transition-opacity group-hover:opacity-100" style={{ color: Number(stop) >= 500 ? '#fff' : '#000' }}>
                      {stop}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <SectionDivider />

        {/* Role Accents */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Role Accents
          </p>
          <div className="flex flex-wrap gap-3">
            {roleAccents.map((r) => (
              <div key={r.role} className="flex items-center gap-2">
                <div
                  className="size-6 rounded-sm"
                  style={{ backgroundColor: r.color }}
                />
                <div>
                  <p className="text-xs font-medium text-foreground">{r.role}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{r.color}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <SectionDivider />

        {/* Semantic Tokens */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Semantic Tokens
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
            {semanticTokens.map((t) => (
              <Swatch key={t.name} cssVar={t.name} label={t.name} size="sm" />
            ))}
          </div>
        </div>

        {/* Sidebar + Chart tokens */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
              Sidebar
            </p>
            <div className="grid grid-cols-4 gap-2">
              {sidebarTokens.map((t) => (
                <Swatch key={t.name} cssVar={t.name} label={t.label} size="sm" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
              Chart
            </p>
            <div className="grid grid-cols-5 gap-2">
              {chartTokens.map((t) => (
                <Swatch key={t.name} cssVar={t.name} label={t.label} size="sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── TYPOGRAPHY ──────────────────────────────────────────────────────
export function TypographyShowcase() {
  return (
    <Section id="typography" title={c.sections.typography}>
      <div className="space-y-8">
        {/* Type Scale Specimen */}
        <div className="space-y-0">
          {typographyScale.map((t) => (
            <div
              key={t.cssVar}
              className="flex items-baseline gap-4 border-b border-border/20 py-3 last:border-0"
            >
              <span
                className={`shrink-0 text-foreground ${t.mono ? 'font-mono' : ''}`}
                style={{
                  fontSize: t.size,
                  lineHeight: t.lineHeight,
                  fontWeight: t.weight,
                  letterSpacing: t.letterSpacing,
                }}
              >
                {t.mono ? 'NGN 1,500,000.00' : 'The quick brown fox'}
              </span>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60">
                {t.name} / {t.size} / {t.weight}{t.letterSpacing && t.letterSpacing !== '0em' ? ` / ${t.letterSpacing}` : ''}
              </span>
            </div>
          ))}
        </div>

        <SectionDivider />

        {/* Font Families */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Font Families
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border/40 p-4">
              <p className="mb-1 font-mono text-[10px] text-muted-foreground">font-sans</p>
              <p className="text-lg font-medium text-foreground">IBM Plex Sans</p>
              <p className="text-sm text-muted-foreground">UI text, headings, labels</p>
            </div>
            <div className="rounded-lg border border-border/40 p-4">
              <p className="mb-1 font-mono text-[10px] text-muted-foreground">font-mono</p>
              <p className="text-lg font-medium font-mono text-foreground">IBM Plex Mono</p>
              <p className="text-sm text-muted-foreground">Amounts, codes, tokens</p>
            </div>
            <div className="rounded-lg border border-border/40 p-4">
              <p className="mb-1 font-mono text-[10px] text-muted-foreground">font-serif</p>
              <p className="text-lg font-medium font-serif text-foreground">IBM Plex Serif</p>
              <p className="text-sm text-muted-foreground">Certificates only</p>
            </div>
          </div>
        </div>

        <SectionDivider />

        {/* Section Labels */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Section Labels
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                ALL CAPS TRACKED
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">10-11px, uppercase, tracking-widest</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Muted label</p>
              <p className="font-mono text-[10px] text-muted-foreground">12px, medium, muted</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── BORDERS ─────────────────────────────────────────────────────────
export function BordersShowcase() {
  return (
    <Section id="borders" title={c.sections.borders} variant="muted">
      <div className="space-y-8">
        {/* Border Widths */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Border Widths
          </p>
          <div className="flex flex-wrap gap-6">
            {borderTokens.widths.map((b) => (
              <div key={b.name} className="space-y-2">
                <div
                  className="h-16 w-24 rounded-lg bg-card"
                  style={{ border: `${b.value} solid var(--border)` } as React.CSSProperties}
                />
                <p className="text-xs font-medium text-foreground">{b.name}</p>
                <Code>{`${b.cssVar}: ${b.value}`}</Code>
              </div>
            ))}
          </div>
        </div>

        {/* Border Colors */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Border Colors
          </p>
          <div className="flex flex-wrap gap-4">
            {borderTokens.colors.map((c) => (
              <div key={c.name} className="space-y-2">
                <div
                  className="h-16 w-28 rounded-lg bg-card"
                  style={{ border: `2px solid var(${c.cssVar})` } as React.CSSProperties}
                />
                <p className="text-xs font-medium text-foreground">{c.name}</p>
                <Code>{c.cssVar}</Code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── CORNERS ─────────────────────────────────────────────────────────
export function CornersShowcase() {
  return (
    <Section id="corners" title={c.sections.corners}>
      <div className="flex flex-wrap items-end gap-6">
        {radiusTokens.map((r) => (
          <div key={r.name} className="space-y-2 text-center">
            <div
              className="mx-auto size-16 bg-primary/15"
              style={{ borderRadius: r.value }}
            />
            <p className="text-xs font-medium text-foreground">{r.name}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{r.value}</p>
            <p className="font-mono text-[9px] text-muted-foreground/50">{r.cssVar}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── SHADOWS ─────────────────────────────────────────────────────────
export function ShadowsShowcase() {
  return (
    <Section id="shadows" title={c.sections.shadows} variant="muted">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shadowTokens.map((s) => (
          <div
            key={s.name}
            className="flex flex-col justify-between rounded-xl bg-card p-5"
            style={{ boxShadow: `var(${s.cssVar})` } as React.CSSProperties}
          >
            <div>
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.usage}</p>
            </div>
            <p className="mt-3 font-mono text-[10px] text-muted-foreground/60">{s.cssVar}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
