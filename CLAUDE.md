# Doculet.ai V6 — Development Conventions

## Project Overview
Fintech/edtech platform connecting students, sponsors, and universities with proof-of-funds verification.
6 roles: student, sponsor, university, admin, agent, partner.

## Stack
Next.js 16, React 19, Supabase (auth + storage), Drizzle ORM, tRPC, Tailwind CSS 4, shadcn/ui (new-york), Sentry, Resend, Mono, Dojah, Paystack, Vitest, Playwright.

## Architecture

### File Structure
```
src/
  app/                        # Next.js App Router
    (auth)/                   # Auth routes (login, signup, reset)
    (marketing)/              # Public pages (landing, pricing)
    dashboard/                # Protected dashboard
      [role]/                 # Role-parameterized layout
    certificate/[token]/      # Public certificate verification
  components/
    ui/                       # shadcn/ui primitives
    layout/                   # Section, Container, Grid, Stack
    brand/                    # Brand-specific components
    [role]/                   # Role-specific components
  config/
    copy/                     # All UI strings per role
    nav/                      # Nav config per role
  db/
    schema/                   # Drizzle schema files (one per domain)
    queries/                  # Typed query functions using Drizzle
    index.ts                  # Drizzle client singleton
    migrate.ts                # Migration runner
  server/
    routers/                  # tRPC routers (one per domain)
    context.ts                # tRPC context (Drizzle + Supabase session)
    trpc.ts                   # tRPC init, middleware, procedures
    root.ts                   # Root router combining all routers
  lib/
    auth/                     # Supabase auth helpers
    email/                    # Resend + react-email templates
    hooks/                    # Custom React hooks
    utils/                    # Utility functions (cn, formatCurrency, etc.)
    types/                    # Shared TypeScript types
  trpc/
    client.tsx                # tRPC React client setup
    server.ts                 # tRPC server-side caller
tests/
  unit/                       # Vitest unit tests
  e2e/                        # Playwright E2E tests
  fixtures/                   # Typed test fixtures matching DB schema
```

### Key Patterns

**Server Components by default** — only `'use client'` when needed for interactivity

**Page pattern:**
```
page.tsx (Server, async) → fetches via tRPC server caller
  └─ *-page-client.tsx ('use client') → receives data as props, handles interactions
       └─ sub-components
```

**tRPC data fetching:**
```typescript
// Server Component (page.tsx)
const data = await api.student.getProfile();

// Client Component
const { data } = trpc.student.getProfile.useQuery();
const mutation = trpc.student.updateProfile.useMutation();
```

**Drizzle queries:**
```typescript
// src/db/queries/students.ts
export async function getStudentProfile(db: DrizzleDB, userId: string) {
  return db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    with: { sponsorships: true, documents: true }
  });
}
```

**tRPC router:**
```typescript
// src/server/routers/student.ts
export const studentRouter = createTRPCRouter({
  getProfile: protectedProcedure
    .output(StudentProfileSchema)
    .query(async ({ ctx }) => {
      return getStudentProfile(ctx.db, ctx.session.user.id);
    }),
});
```

**Max 400 lines per file** — split when larger

## Design System

### Colors
- Obsidian Blues palette via CSS variables
- Semantic tokens only (`bg-background`, `text-foreground`, `bg-primary`)
- Never raw Tailwind colors
- Dark mode: `dark:` variants on everything
- `@custom-variant dark (&:where(.dark, .dark *));` MUST be in globals.css

### Typography
- Responsive: `text-sm md:text-base lg:text-lg`
- No arbitrary pixel sizes

### Spacing
- T-shirt sizes: xs(4px), sm(8px), md(16px), lg(24px), xl(32px)
- Use layout components, not raw `space-y-*`

### Layout Primitives (MANDATORY for dashboard)
- Dashboard pages (`src/app/dashboard/**`) MUST use content-primitives:
  - PageShell, Section, Container, Grid, Stack, PageHeader from `@/components/layout/content-primitives`
- NEVER use raw `<section className="mx-auto max-w-...">` or `<div className="grid grid-cols-...">` for page-level layout.
- Enforced by `npm run layout-check` and `scripts/swarm/layout-audit.sh`.

### Icons
- Phosphor Duotone only (`@phosphor-icons/react`) — no other icon libraries
- Always use `weight="duotone"` on icon JSX
- Nav: 24px, Inline: 20px, Small: 16px

## Coding Standards

### TypeScript
- Strict mode, no `any` types
- No `@ts-ignore`, `@ts-nocheck`, `eslint-disable`
- Proper interfaces for all data structures
- Zod schemas for all tRPC inputs/outputs

### tRPC Conventions
- One router per domain: `student.ts`, `sponsor.ts`, `university.ts`, `admin.ts`, `agent.ts`, `partner.ts`
- `publicProcedure` for unauthenticated endpoints
- `protectedProcedure` for authenticated (checks session)
- `roleProcedure('student')` for role-gated endpoints
- Input validated with Zod schemas
- Output typed with Zod schemas (never `any`)

### Drizzle Conventions
- Schema in `src/db/schema/` — one file per domain (e.g., `users.ts`, `documents.ts`)
- All relations declared in schema files
- Queries in `src/db/queries/` — pure functions, no side effects
- Never raw SQL unless absolutely necessary
- Always use `ctx.db` from tRPC context — never instantiate Drizzle directly in components

### Components
- Every async operation: loading + error + empty state
- Every form: Zod validation + react-hook-form + tRPC mutation
- Every page: `export const metadata` for SEO
- Every route segment: matching `error.tsx` boundary
- Every layout: `<Suspense>` wrapping async children
- All interactive elements: keyboard accessible with `focus-visible` rings
- WCAG 2.1 AA contrast minimum
- `cn()` utility for class merging

### Layout & Copy (MANDATORY)
- Dashboard layout: use PageShell, Section, Grid, Stack, PageHeader — never raw section/div with mx-auto max-w- or grid grid-cols-.
- All copy: from `src/config/copy/` or primitivesCopy — never hardcoded in JSX.

### No Mocks, No Stubs (MANDATORY)
- NEVER use `vi.mock()`, `jest.mock()`, `msw`, or any mocking library
- All test data: typed fixtures in `tests/fixtures/` matching real DB schema
- If code can't be tested without a mock → restructure the code
- Pure query functions in `src/db/queries/` are testable without mocks

### Images & Links
- `next/image` for all images
- `next/link` for internal navigation
- No inline styles

## Dev Scripts

- `npm run dev` — Next.js (Turbopack)
- `npm run check` — lint + typecheck + tests + layout-check (parallel)
- `npm run layout-check` — enforce content-primitives in dashboard (fails on raw layout patterns)
- `npm run design-check` — layout-audit + copy-audit (design framework enforcement)
- `npm run test` — Vitest unit tests
- `npm run test:e2e` — Playwright E2E
- `npm run db:generate` — Drizzle generate migrations
- `npm run db:migrate` — run migrations
- `npm run db:push` — push to Supabase
- `npm run db:studio` — Drizzle Studio

## Git Conventions
- Conventional commits: `type(scope): message`
- Types: feat, fix, chore, docs, test, refactor, style, perf
- No `Co-Authored-By` lines
- No `git add -A` — add specific files
- Pre-commit: `npm run check`

## Author
Goldmayo Daniel / doculet.ai — NO AI attribution anywhere

## Responsive Standards (MANDATORY)
- Mobile-first always — default styles mobile, sm:/md:/lg: for larger
- Test at: 375px, 390px, 768px, 1024px, 1440px
- Touch targets: 44×44px minimum
- No horizontal scroll ever
- Tables → cards on mobile
- Modals → full-screen on mobile

## Core Principles
- **Simplicity First**: minimum code for current task
- **No Laziness**: find root causes, no temporary fixes
- **Minimal Impact**: only touch what's necessary

## Feature Shipping Checklist (MANDATORY)

Every feature follows this skill sequence before merge:

| Stage | Skill | When |
|-------|-------|------|
| Before building | `/frontend-design` | Any new page or major UI |
| During development | `/audit` | After first working version |
| During development | `/clarify` | When copy feels vague or off-brand |
| During development | `/normalize` | After integrating with design system |
| Before merge | `/product-owner` | Required — GO verdict needed to ship |
| Final pass | `/polish` | Before opening PR |

**`/product-owner` is the merge gate.** It evaluates 9 lenses: persona fit, scope drift, copy compliance, role-awareness, trust signals, emotional goal, copy voice, visual quality, and user journey completeness. A NO-GO blocks the PR.

When `/product-owner` returns findings, use these impeccable skills to fix them:
- Copy Voice issues → `/clarify`
- Visual Quality issues → `/audit` then `/normalize`
- User Journey gaps → `/harden` or `/onboard`
- Persona Fit issues → `/clarify` + `/critique`
- Emotional Goal drift → `/delight` or `/distill`

---

## Design Context

### Users
6 roles using the platform for proof-of-funds verification in international education:
- **Student** — Anxious, hopeful. Job: prove they can afford their program. Context: Nigerian students preparing for university enrollment.
- **Sponsor** — Cautious, needs trust. Job: fund education and stay accountable. Sub-types: corporate (audit-first), parent (emotional), self-funded.
- **University** — Busy, needs bulk ops. Job: process applications efficiently.
- **Admin** — Methodical, risk-aware. Job: operate the platform safely.
- **Agent** — Entrepreneurial. Job: help students through the process.
- **Partner** — Technical, ROI-focused. Job: embed Doculet in their institution.

### Brand Personality
**Bold, Modern, Confident.** Nigerian-market fintech that feels like a trusted institution, not a startup experiment. Voice per persona: warm/encouraging (student), clear/professional (sponsor), efficient/authoritative (university). Obsidian Blues palette, Doculet seal on certificates.

### Emotional Goals
- **Confidence + Calm** when viewing status, balances, verification state
- **Progress + Achievement** when completing milestones, receiving certificates
- Both moods coexist: the interface celebrates forward motion while maintaining institutional composure

### Aesthetic Direction
- **Tone:** "Safe & in good hands" — bank-grade authority, warm not clinical. Like a private banker's portal, not a SaaS dashboard.
- **Reference:** Wise + Revolut (consumer fintech warmth, friendly, clear financial flows). Stripe Dashboard (clean, precise, credible) for data hierarchy.
- **Anti-reference:** Generic SaaS dashboards (cookie-cutter Bootstrap/template, flat gray-on-white monotony). Overly playful apps (rounded bubbly UI, gradients, emojis, cartoon illustrations). Veriff (clinical, sterile).
- **Colors:** Warm white `#FDFCFA` base. Brand blue `#2B39A3` (logo) as signature. Role-tinted active states (see Role Accents below). No pure white/black.
- **Role Accents (active nav colour per role):** Student `#2B39A3`, Sponsor `#15803D`, University `#0369A1`, Admin `#C2410C`, Agent `#6D28D9`, Partner `#0F766E`.
- **Typography:** IBM Plex Sans (UI primary — set globally). IBM Plex Mono (amounts, codes). IBM Plex Serif (certificates only). Section headers: 10-11px, ALL CAPS, tracked wide.
- **Sidebar:** Stripe-clean white with warm tint. Role accent only on active item (border + bg wash + text). Section labels muted gray. Logo at full 36px PNG, not icon substitute.
- **Unforgettable element:** Role-tinted sidebar (each user's dashboard feels uniquely theirs) + Doculet seal on certificates.
- **NO EMOJIS** — never in UI, copy, code comments, or commit messages. Zero tolerance.

### Design Principles
1. **Trust first** — Exact amounts in NGN, masked BVN/NIN, clear status badges. Every UI element should signal stability.
2. **Role-aware** — Each role has a distinct accent colour. The dashboard feels personalised without being chaotic.
3. **Persona-appropriate voice** — Copy from `config/copy/`; never hardcode.
4. **Precision over decoration** — No glassmorphism, no gradient text, no card grids. Clean lines, deliberate spacing.
5. **Layout primitives mandatory** — PageShell, Section, Grid, Stack, PageHeader; never raw mx-auto max-w-.
6. **Accessibility** — WCAG 2.1 AA, 44x44px touch targets, focus-visible rings.
7. **No emojis anywhere** — UI, copy configs, code, commits. The brand is institutional, not casual.
