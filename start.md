# Doculet.ai V6 — Product Brief

## What We Build

Doculet.ai is a proof-of-funds verification platform for international education financing.

**Core value chain:**
Student proves funds → Sponsor commits capital → University verifies → Certificate issued → Student gets visa/enrollment

## The 6 Roles

| Role | Job-to-be-done | Feeling |
|------|----------------|---------|
| **Student** | "Prove I can afford this program" | Anxious, hopeful |
| **Sponsor** | "Fund education and stay accountable" | Cautious, needs trust |
| **University** | "Process applications efficiently" | Busy, needs bulk ops |
| **Admin** | "Operate the platform safely" | Methodical, risk-aware |
| **Agent** | "Help students through the process" | Entrepreneurial |
| **Partner** | "Embed Doculet in my institution" | Technical, ROI-focused |

## Sponsor Sub-types

- **Corporate** — accountability-first, compliance reports, audit trails
- **Parent/Guardian** — emotional, "my child's future", simple UI
- **Self-funded** — student IS the sponsor, skip sponsor pipeline

## Tech Stack

- **Framework:** Next.js 16 App Router
- **Database:** Supabase (auth + storage) + Drizzle ORM (type-safe queries)
- **API:** tRPC (end-to-end type safety, no raw API routes)
- **UI:** Tailwind CSS 4 + shadcn/ui (new-york) + Lucide icons
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Email:** Resend
- **KYC:** Dojah
- **Banking:** Mono
- **Payments:** Paystack
- **Errors:** Sentry
- **Analytics:** PostHog

## Architecture Rules

- Server Components by default — `'use client'` only when needed
- Page pattern: `page.tsx` (Server) → `*-page-client.tsx` (Client) → sub-components
- Data: tRPC procedures, never raw fetch in components
- DB: Drizzle schema in `src/db/schema/`, queries in `src/db/queries/`
- tRPC routers in `src/server/routers/`, one file per domain
- Copy: `src/config/copy/[role].ts` — never hardcode strings in JSX
- Max 400 lines per file

## V6 Improvements Over V5

1. **Drizzle ORM** — replaces 40+ raw Supabase query files, full TypeScript type inference
2. **tRPC** — replaces 197 raw API routes, end-to-end type safety from DB to UI
3. **Conductor orchestration** — swarm builds itself wave by wave, hands-free
4. **GitHub Actions CI** — typecheck + tests → auto-merge on green
5. **No legacy baggage** — clean room, no V1/V2 migration debt
6. **Outgoing webhooks fixed from day 1** — delivery layer built in Wave 7
7. **Partner API keys from day 1** — revenue model activated at launch

## Delivery Model

Built entirely by codex agents in isolated git worktrees.
Orchestrated by conductor script reading `docs/plans/master-plan.json`.
Each wave auto-spawns after previous wave PRs merge.
CI gates quality — human reviews only on red CI.

## Success Definition

A student in Nigeria can:
1. Sign up → select school + program
2. Complete KYC (Dojah) + connect bank (Mono)
3. Invite a sponsor → sponsor verifies + signs affidavit
4. Receive a tamper-evident proof certificate
5. Share certificate with university
6. University confirms enrollment

All of the above: working, tested, mobile-first, dark mode, WCAG 2.1 AA, under 3s load time.
