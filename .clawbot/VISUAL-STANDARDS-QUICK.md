# Visual Standards Checklist (Quick Reference)

Every page built in V6 MUST pass all these checks before opening a PR.
Run through this list manually or ask Claude to verify.

## REQUIRED: Every Page

- [ ] **h1 heading** — page has an accessible `<h1>` (screen readers + SEO)
- [ ] **Skeleton loading** — `<Suspense fallback={<XxxSkeleton />}>` wraps async content. Skeleton matches the final content shape exactly (not generic blocks)
- [ ] **Empty state** — when data is empty: illustration/icon + heading + description + CTA button. NEVER just "No results found."
- [ ] **Error state** — `error.tsx` boundary exists. Shows: what went wrong + retry button + support email (support@doculet.ai)
- [ ] **Mobile (375px)** — no horizontal scroll, all touch targets ≥ 44×44px
- [ ] **Dark mode** — semantic tokens only (`bg-card`, `text-muted-foreground` etc.), tested with `.dark` class

## REQUIRED: Copy & Icons

- [ ] **Copy from config** — all strings from `src/config/copy/[role].ts`. Zero hardcoded strings in JSX
- [ ] **Nigerian context** — amounts in ₦ (₦2,400,000), timezone WAT, phone +234, banks named correctly
- [ ] **Lucide icons only** — nav=`size-6`, inline=`size-5`, status=`size-4`. ZERO emoji characters.
- [ ] **No placeholders** — "TODO", "Lorem ipsum", "Coming soon", "Click here" = BUGS, block PR
- [ ] **No emojis** — NEVER use emoji characters (✅, 🎉, 🔒 etc.) anywhere in the UI. Icons only.

## REQUIRED: Data & Forms

- [ ] **Real data wired** — tRPC calls to real Supabase. Zero mock data, zero `vi.mock()`
- [ ] **Forms validated** — Zod schema + react-hook-form. Inline field errors (not toast snackbars)
- [ ] **Images** — `next/image` only. Links: `next/link` only.
- [ ] **No console.log** — use Sentry `captureException` for errors

## REQUIRED: Product Context

- [ ] **Status badges correct** — Tier 1=gray, Tier 2=blue, Tier 3=green+shield
- [ ] **BVN/NIN format** — always 11 digits, validated with Zod `.length(11)`
- [ ] **Certificate amounts** — ₦ prefix, comma-formatted (use `Intl.NumberFormat('en-NG')`)
- [ ] **Timestamp format** — "March 4, 2026 at 14:32 WAT" not ISO strings
- [ ] **Verification states** — pending/verified/failed all have distinct UI (not just text)

## REQUIRED: Security (Authenticated Pages)

- [ ] **Session security visible** — every authenticated dashboard shows: last login location (city, country, WAT timestamp), device info (browser + OS), link to "Manage sessions"
- [ ] **Suspicious login alert** — if a new country/device is detected, banner appears in dashboard

## REQUIRED: Playwright Visual Verification (MANDATORY BEFORE MARKING DONE)

Every page MUST be Playwright-verified before marking complete:
1. Screenshot at 375px (mobile)
2. Screenshot at 1440px (desktop)
3. Full wave audit at end of each wave
4. Every PR triggers screenshots to catch regressions

## QUICK AUDIT COMMAND

After building a page, run:
```bash
npx tsc --noEmit && npm run lint
```
Then manually visit at 375px viewport in Chrome DevTools and verify:
1. No horizontal scroll
2. All text readable (≥13px)
3. Tap targets clearly large enough
4. Dark mode looks correct (toggle with ThemeProvider)
5. No emoji characters visible anywhere on the page
