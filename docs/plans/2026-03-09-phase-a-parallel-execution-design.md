# Phase A — Parallel Agent Execution Design

**Date:** 2026-03-09
**Status:** Approved
**Goal:** Execute all 12 Phase A foundation tasks using 8 parallel git worktree agents in 2 waves.

---

## Architecture

2 waves, 8 isolated worktree agents total. Each agent runs in its own git worktree branch. Wave 2 starts only after all Wave 1 branches merge to main.

```
Wave 1 (6 agents, parallel)
├── w1-shell      → A1 + A1b  (sidebar + topbar)
├── w1-primitives → A1c        (content area primitives)
├── w1-auth       → A2 + A3   (auth flows + invite links)
├── w1-payments   → A4 + A5   (Paystack webhook + disbursement button)
├── w1-cert       → A6         (certificate PDF)
└── w1-emails     → A7–A10    (referral URL + 3 email templates)

Wave 2 (2 agents, parallel — after Wave 1 merges)
├── w2-mobile-tab → A11        (MobileTabBar component)
└── w2-mobile-375 → A12        (375px student verification)
```

---

## Wave 1 Agent Details

### w1-shell — Sidebar + TopBar (A1 + A1b)
- **Files:** `src/components/layout/TopBar.tsx`, `src/components/layout/NotificationsBell.tsx`, sidebar components, `src/server/routers/dashboard.ts`
- **Deliverables:** 58px topbar, avatar ring shadow, breadcrumb spec, notif dropdown, `SidebarUserCard` with real user data, `getDisplayUser` tRPC procedure
- **Context loads:** `ship-a-foundation.md` tasks A1+A1b, `docs/sidebar-preview.html` CSS lines 63-165
- **Success gate:** `npm run check` clean

### w1-primitives — Content Area Primitives (A1c)
- **Files:** `src/components/ui/` and `src/components/student/` — stat cards, tier cards, banking choice cards, OCR review card, upload zone, funding type cards, modal, bottom sheet
- **Deliverables:** All 12 primitive steps from A1c spec, zero raw color tokens
- **Context loads:** `ship-a-foundation.md` task A1c, `docs/sidebar-preview.html` primitive specs
- **Success gate:** All primitives match prototype pixel spec, `npm run check` clean

### w1-auth — Magic Link + Invite Links (A2 + A3)
- **Files:** `src/app/(auth)/` magic link pages, invite link route handler, `src/server/routers/` invite procedures, `src/config/copy/auth.ts`
- **Deliverables:** Magic link auth UI, agent/partner/university invite link flows
- **Context loads:** `ship-a-foundation.md` tasks A2+A3
- **Success gate:** Invite flows working end-to-end, `npm run check` clean

### w1-payments — Paystack Webhook + Disbursement (A4 + A5)
- **Files:** `src/app/api/webhooks/paystack/`, disbursement button in sponsor pages, `src/server/routers/sponsor.ts`
- **Deliverables:** `charge.success`, `transfer.success`, `transfer.failed` webhook handlers; disbursement button wired to tRPC mutation
- **Context loads:** `ship-a-foundation.md` tasks A4+A5, `src/config/copy/sponsor.ts`
- **Success gate:** Webhook signature verification passing, `npm run check` clean

### w1-cert — Certificate PDF (A6)
- **Files:** `src/app/api/certificate/` PDF generation
- **Deliverables:** PDF with QR code (bottom-right), Doculet seal (bottom-left), diagonal watermark, legal name, school, program, NGN amount (IBM Plex Mono), cert ID (DOC-2026-XXXXX), issue + expiry date, public verification URL
- **Context loads:** `ship-a-foundation.md` task A6, `docs/product-decisions.md` cert section
- **Success gate:** PDF renders all 5 required elements, `npm run check` clean

### w1-emails — Referral URL + Email Templates (A7–A10)
- **Files:** `src/lib/email/templates/` (welcome, password-reset, disbursement-confirmation), `src/lib/email/send-*.ts`, `src/server/routers/agent.ts` (referral URL)
- **Deliverables:** Agent referral URL stored and retrievable; 3 email templates render in preview
- **Context loads:** `ship-a-foundation.md` tasks A7-A10
- **Success gate:** All templates render, `npm run check` clean

---

## Wave 2 Agent Details

### w2-mobile-tab — MobileTabBar (A11)
- **Depends on:** `w1-shell` merged to main
- **Files:** `src/components/layout/MobileTabBar.tsx` (new), `src/app/dashboard/[role]/layout.tsx`
- **Deliverables:** 4-item bottom tab bar per role, role-accent active state, 44px touch targets, iOS safe-area padding, hidden at `md:` and above
- **Context loads:** `ship-a-foundation.md` task A11, `src/config/nav/[role].ts` for all 6 roles
- **Success gate:** Renders at 375px for all 6 roles, `npm run check` clean

### w2-mobile-375 — 375px Student Verification (A12)
- **Depends on:** `w1-primitives` merged to main
- **Files:** 5 student pages — overview, setup, verification, documents, proof
- **Deliverables:** No horizontal scroll, 44px touch targets, all primitives correct at 375px
- **Context loads:** `ship-a-foundation.md` task A12
- **Success gate:** All 5 pages pass at 375px, `npm run check` clean

---

## Merge Strategy

1. After all 6 Wave 1 agents complete, merge in this order:
   - `w1-shell` first (establishes sidebar/topbar tokens)
   - `w1-primitives` second (establishes component primitives)
   - `w1-auth`, `w1-payments`, `w1-cert`, `w1-emails` in any order
2. Run `npm run check` on main after each merge — fix conflicts inline
3. Once all 6 Wave 1 branches are on main, launch Wave 2 in parallel

---

## Context Isolation Rule

Each agent's prompt loads only:
- Its task section(s) from `docs/plans/2026-03-08-ship-a-foundation.md`
- Referenced files: role-specific copy config, nav config, `docs/sidebar-preview.html` where specified
- `docs/DESIGN-AUDIT-CONTEXT.md` for design token rules (~200 lines)
- **NOT** the full CLAUDE.md

---

## Success Criteria

Phase A is complete when:
- All 8 worktree branches merged to main
- `npm run check` passes on main (lint + typecheck + tests + layout-check)
- No raw color tokens in any modified file
- All touch targets meet 44px minimum
- MobileTabBar renders at 375px for all 6 roles
