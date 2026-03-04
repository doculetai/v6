# V6 Factory — Operating Instructions

## Mission

Build production-ready fintech components for Doculet.ai V6. Every component uses tRPC for data fetching, Drizzle for DB access, and is grounded in product context. Every component is designed for trust, secured by default, QA-verified, and simplified for maintainability.

## The 11-Layer Protocol (MANDATORY)

For EVERY component request, walk through ALL layers in order. Skip nothing.

### PRODUCT LAYER — Understand what to build

**Layer 0A: Product Owner** (read `skills/product-owner/`)
- Which persona is this for? What's their job-to-be-done?
- What business rules apply? What cross-persona chains touch this?
- What copy voice? (warm/encouraging for student, trust-building for sponsor, efficient for university)
- Output: 2-3 sentence context brief

**Layer 0B: Product Manager** (read `skills/product-manager/`)
- What route does this live at? What state machine applies?
- What are the acceptance criteria? What edge cases matter?
- What empty/loading/error states are needed?
- Output: Acceptance criteria checklist

**Layer 0C: Product Designer** (read `skills/product-designer/`)
- What design tokens apply? (colors, spacing, typography)
- What status badges needed? What icons at what sizes?
- What layout pattern? (Grid, Stack, Section → Container)
- Output: Visual spec (tokens + layout + icons)

### ENGINEERING LAYER — Build it right

**Layer 1: Design Intent** (read `skills/ui-ux-pro-max/`, `skills/frontend-design-ultimate/`)
- What aesthetic tone? (Luxury/Refined for fintech, Editorial for dashboards)
- What's the ONE unforgettable design element?
- Output: UX brief + aesthetic direction

**Layer 2: Fintech Trust** (read `skills/fintech-engineer/`)
- What trust signals? (verification badges, audit trails, security indicators)
- Handles money? → exact amounts, currency codes, timestamps
- Shows identity? → verification tier badges, KYC status
- Output: Trust signal checklist

**Layer 3: Architecture** (read `skills/nextjs-expert/`)
- Server Component (default) or Client Component?
- Page pattern: `page.tsx` (Server) → `*-page-client.tsx` (Client) → sub-components
- Data: tRPC query via `api.router.procedure.useQuery()` (client) or `caller` (server)?
- Error boundary needed? Loading boundary? Suspense wrapping?
- Output: Component architecture decision

**Layer 4: Implementation** (read `skills/v6-component-builder/`, `skills/shadcn-ui/`, `skills/tailwind-v4-shadcn/`)
- Follow 5-stage pipeline: Generate → Review → Test → Storybook → Commit
- Import `cn` from `@/lib/utils`, layout components from `@/components/layout`
- Semantic tokens only. `dark:` variants on everything. Mobile-first 375px.
- Copy from `@/config/copy/` — never hardcode strings
- Lucide icons only: Nav 24px, Inline 20px, Small 16px
- Max 400 lines per file
- tRPC procedures in `server/routers/` — never raw `fetch()` calls in components
- Drizzle queries via `db.*` client — never raw SQL strings or Supabase SDK queries
- Output: TypeScript component + copy config entries

**Layer 5: Simplification** (read `skills/code-simplifier/`)
- Max 400 lines, max 30 lines per function, max 3 nesting levels
- Early returns, named booleans, flat ternaries, module facades
- No premature abstractions, no dead code
- Output: Simplified, clean code

**Layer 6: tRPC Procedure Design**
- Does this need a **query** procedure (read, cacheable) or **mutation** procedure (write, side-effect)?
- Define input Zod schema: what does the caller pass in?
- Define output Zod schema: what shape does the caller receive?
- Which router does this belong in? (e.g., `server/routers/student.ts`, `server/routers/sponsor.ts`)
- Does the procedure require auth? Which roles are permitted? Add middleware guard.
- Is the result paginated? Use cursor-based pagination (not offset).
- Output: Procedure signature with input/output Zod schemas + router placement

**Layer 7: Drizzle Schema & Relations**
- What table(s) does this procedure touch? (reference `server/db/schema/`)
- What columns are read vs. written? Are any nullable, requiring null-safety?
- What relations need to be eager-loaded? (use Drizzle `with:` relational queries)
- Is a join needed, or is relational querying sufficient?
- Are indexes needed for this query's WHERE / ORDER BY columns?
- Does a write operation need a transaction? (multi-table writes → wrap in `db.transaction()`)
- Output: Drizzle query pattern + any missing schema changes identified

**Layer 8: Security Review** (read `skills/security-engineer/`)
- Input validation with Zod at all tRPC boundaries (Layer 6 already defines schemas — enforce them)
- Auth + role checked via tRPC middleware before data access — never inside the procedure body
- No PII in logs or URLs, no secrets in client code
- Financial amounts use integer arithmetic (pence/kobo), sensitive data masked in responses
- Drizzle parameterized queries prevent SQL injection by default — verify no raw SQL escape hatches
- Output: Security checklist passed

**Layer 9: QA Verification** (read `skills/qa-engineer/`)
- Unit tests with typed fixtures (no mocks)
- Edge case matrix covered (empty, boundary, error, cross-persona)
- Accessibility checklist (keyboard, contrast, ARIA, focus rings)
- Output: QA verdict (pass/fail + issues)

**Layer 10: Documentation** (read `skills/storybook/`)
- `.stories.tsx` with `satisfies Meta`, `tags: ["autodocs"]`
- Controls for all meaningful props
- Variants: Default, WithData, Empty, Loading, Error, DarkMode
- Typed fixture data from `tests/fixtures/`
- Output: Storybook story file

**Layer 11: Aesthetics Gate** (read `skills/frontend/`)
Self-review — if ANY fail, fix before outputting:
- [ ] ONE unforgettable design element present?
- [ ] No generic fonts (Inter/Roboto/Arial banned — use IBM Plex)?
- [ ] No solid white/gray backgrounds (add depth with glass surfaces)?
- [ ] Typography uses dramatic size jumps (2x+)?
- [ ] Color follows 70-20-10 rule?
- [ ] Dark mode isn't an afterthought?
- [ ] Mobile (375px) works without horizontal scroll?

## Stack

- **Next.js 16** — App Router, Server Components by default
- **Supabase** — Auth and Storage only (NOT used for DB queries)
- **Drizzle ORM** — all database access; schema in `server/db/schema/`
- **tRPC** — all data fetching and mutations; routers in `server/routers/`
- **Tailwind CSS 4** — semantic tokens, mobile-first, dark mode via class
- **shadcn/ui (new-york)** — UI primitives in `src/components/ui/`

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/components/ui/` | shadcn/ui primitives |
| `src/components/[role]/` | Role-specific (student, sponsor, university, admin, agent, partner) |
| `src/components/shared/` | Cross-role shared components |
| `src/components/layout/` | Section, Container, Grid, Stack |
| `src/config/copy/` | All UI copy (never hardcode strings) |
| `server/routers/` | tRPC routers (one file per domain/persona) |
| `server/db/schema/` | Drizzle schema files (one file per domain) |
| `server/db/index.ts` | Drizzle client instance |
| `server/trpc.ts` | tRPC init, context, middleware |
| `tests/fixtures/` | Typed test data (no mocks) |

## The 6 Personas

| Persona | Voice | Primary Job |
|---------|-------|-------------|
| **Student** | Warm, encouraging, hopeful | Secure proof-of-funds for university enrollment |
| **Sponsor** | Trust-building, clear, professional | Fund a student's education, track disbursements |
| **University** | Efficient, authoritative | Verify student funding status, approve enrollment |
| **Admin** | Operational, precise | Oversee platform health, resolve issues |
| **Agent** | Helpful, knowledgeable | Assist students and sponsors through the process |
| **Partner** | Business-oriented, ROI-focused | White-label the platform for institutional clients |

## Rules

- NEVER use `@ts-ignore`, `@ts-nocheck`, or `eslint-disable`
- NEVER write "Lorem ipsum", "TODO", or placeholder copy
- NEVER use `vi.mock()`, `jest.mock()`, or any mocking library
- NEVER use raw Supabase SDK queries for data fetching — use Drizzle via tRPC
- NEVER write raw `fetch()` calls in components — use tRPC procedures
- Max 400 lines per file — split when larger
- Conventional commits: `feat(component): add ComponentName`
- Branch: `feat/<name>`, specific file staging (never `git add -A`)
