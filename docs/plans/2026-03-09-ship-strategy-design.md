# Ship Strategy — All-Role Journey Audit + Fix

**Date:** 2026-03-09
**Goal:** Get Doculet V6 production-ready by auditing all 6 roles visually, mapping gaps into 4 parallel fix buckets, executing fixes, and passing a product-owner quality gate before PR.

---

## Context

Previous approach (executing SHIP plan A task-by-task) was too granular — it was completing individual infrastructure tasks while structural gaps in user journeys remained unfixed. The user identified: no working student journey end-to-end, potential seal/hardcoded blocks.

Code audit found:
- TypeScript: clean. Layout primitives: compliant. Certificate PDF: QR + seal + watermark all present.
- Real gap: `ApplicationSwitcher` in Sidebar is a hard stub (`applications={[]}`, `onSwitch` is no-op).
- No `student.listApplications` or `student.switchApplication` tRPC procedure exists.
- `dashboard.getDisplayUser` procedure may be missing (TopBar avatar shows static fallback).
- Several page clients have placeholder UI sections.

---

## Strategy

### Phase 0: Visual Screenshot Audit (all 6 roles)

Start dev server. Use Playwright to capture each role's pages at 1440px desktop.

**Student (6 pages):** overview, onboarding, verification, documents, proof, settings
**Sponsor (5 pages):** overview, students, commitments, disbursements, settings
**University (5 pages):** overview, students, programs, pipeline, settings
**Admin (8 pages):** overview, queue, users, risk, fraud, ledger, platform-fees, settings
**Agent (5 pages):** overview, students, activity, commissions, settings
**Partner (6 pages):** overview, api-keys, analytics, branding, webhooks, settings
**Public:** /certificate/[token] public verification page

For each screenshot:
- Does the page load without errors?
- Does it show real data or stub/empty state?
- Does the UI match product-decisions.md spec?
- Is the journey state correct for the role?

### Phase 1: Gap Classification

Gaps from the audit go into one of 4 buckets:

**Bucket 1 — Journey state logic**
- `computeStudentJourney()` stage transitions wired correctly
- `ApplicationSwitcher`: real tRPC procedure + real data
- Overview cards: correct state (first-session / mid-journey / cert-issued / post-cert)
- Student trust stage in sidebar reflects actual DB state

**Bucket 2 — Backend/tRPC gaps**
- `student.listApplications` / `student.switchApplication` missing
- `dashboard.getDisplayUser` for real avatar initials
- Any procedures returning empty/stub responses

**Bucket 3 — UI rendering & copy**
- Pages with static/hardcoded content bypassing `@/config/copy/`
- Stub UI sections on support, team, bulk-invite pages
- ApplicationSwitcher visual rendering when empty

**Bucket 4 — Certificate & proof flow**
- `/certificate/[token]` public page renders correctly
- PDF seal path resolves in local dev AND production (SEAL_PATH env check)
- Cert fee payment → cert issue → proof page state transition works
- CertSharingSheet WhatsApp / download / link CTAs all functional

### Phase 2: Parallel Fix Execution

4 parallel `general-purpose` agents, one per bucket. Each agent:
1. Reads the gap list for its bucket
2. Reads relevant source files
3. Fixes gaps — no stubs, no TODOs
4. Runs `npx tsc --noEmit`
5. Commits with `fix(bucket-N): ...`

Main context orchestrates: collects results, resolves any cross-bucket conflicts, runs `npm run check`.

### Phase 3: Quality Gate

After all 4 buckets fixed:
1. Run `/product-owner` — must return GO
2. If NO-GO: fix findings using skill pairings from CLAUDE.md
3. Run `/polish` — fix all flagged items
4. Re-run `npm run check` + `npm run layout-check`
5. Open PR

---

## Success Criteria

- [ ] All 35 pages load without errors in dev
- [ ] Student can complete: login → onboarding → T1 phone → T2 identity → T3 banking → upload docs → view proof → download cert
- [ ] Admin can: view queue, approve doc, issue cert
- [ ] Sponsor can: commit, view students, initiate disbursement
- [ ] No stub/no-op functions in any production code path
- [ ] `npm run check` passes clean
- [ ] `/product-owner` returns GO
- [ ] PR opened

---

## Key Files

| Area | File |
|------|------|
| Student journey model | `src/lib/journey/student.ts` |
| Application switching | Missing — needs creation |
| TopBar avatar | `src/components/layout/TopBar.tsx` |
| Sidebar ApplicationSwitcher | `src/components/layout/Sidebar.tsx:190-195` |
| Certificate PDF | `src/lib/certificate-pdf.tsx` |
| Public cert page | `src/app/certificate/[token]/page.tsx` |
| Cert fee payment | `src/server/routers/student-payment.procedures.ts` |
| tRPC root | `src/server/root.ts` |
