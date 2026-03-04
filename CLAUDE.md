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

### Icons
- Lucide only — no other icon libraries
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

### No Mocks, No Stubs (MANDATORY)
- NEVER use `vi.mock()`, `jest.mock()`, `msw`, or any mocking library
- All test data: typed fixtures in `tests/fixtures/` matching real DB schema
- All copy: from `src/config/copy/` — never hardcoded in JSX
- If code can't be tested without a mock → restructure the code
- Pure query functions in `src/db/queries/` are testable without mocks

### Images & Links
- `next/image` for all images
- `next/link` for internal navigation
- No inline styles

## Dev Scripts

- `npm run dev` — Next.js (Turbopack)
- `npm run check` — lint + typecheck + tests (parallel)
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
