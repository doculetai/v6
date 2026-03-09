# Phase A — Parallel Agent Execution Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete all Phase A foundation tasks using 6 Wave 1 worktree agents + 2 Wave 2 agents running in parallel.

**Architecture:** Each agent runs in an isolated git worktree branch off `main`. Wave 1 (6 agents) runs simultaneously. Wave 2 (2 agents) starts only after all Wave 1 branches merge to main. Each agent does a state-check first — many tasks are already substantially complete in `doculet-app`; agents fill gaps against the reference spec.

**Tech Stack:** Next.js 16, React 19, Drizzle ORM, tRPC v11, Tailwind CSS 4, Supabase, Resend, Paystack, react-pdf, Playwright.

**Primary codebase:** `/Users/gm/doculet-app` — all file edits go here.
**Plans/docs:** `/Users/gm/v6/docs/plans/` — read-only reference.

---

## Pre-Flight: Orchestrator Tasks (do before launching agents)

### Task P1: Create Wave 1 worktrees

```bash
cd /Users/gm/doculet-app

git worktree add .worktrees/w1-shell    -b phase-a/w1-shell
git worktree add .worktrees/w1-primitives -b phase-a/w1-primitives
git worktree add .worktrees/w1-auth     -b phase-a/w1-auth
git worktrees add .worktrees/w1-payments -b phase-a/w1-payments
git worktree add .worktrees/w1-cert     -b phase-a/w1-cert
git worktree add .worktrees/w1-emails   -b phase-a/w1-emails
```

### Task P2: Launch 6 Wave 1 agents simultaneously

Open 6 Claude Code sessions, one per worktree. Give each agent ONLY:
1. Its task section from `/Users/gm/v6/docs/plans/2026-03-08-ship-a-foundation.md`
2. `docs/DESIGN-AUDIT-CONTEXT.md` for token rules
3. The file paths listed in its section below
4. **NOT** the full CLAUDE.md

---

## Wave 1, Agent 1: w1-shell (A1 + A1b)

**Worktree:** `/Users/gm/doculet-app/.worktrees/w1-shell`
**Branch:** `phase-a/w1-shell`

**State check first:** Most sidebar + topbar work is done. Verify gaps before implementing.

### Task 1.1: Audit TopBar against reference spec

Read `src/components/layout/TopBar.tsx`. Check each item:
- [ ] Height: `var(--topbar-height)` resolves to `58px` ✅ (already done via CSS var)
- [ ] Padding: `px-7` (28px)
- [ ] Breadcrumb: 13px, `rgba(15,23,42,0.40)`, current page `#0F172A` weight 600
- [ ] Search: `flex-1 max-w-[300px] mx-auto`, height 34px, border-radius 8px
- [ ] Gear icon: 18px, Phosphor Duotone
- [ ] Avatar: `h-[30px] w-[30px]`, `bg: var(--role-accent)`, ring shadow ✅ (already done)
- [ ] Gap between right elements: `gap-[6px]`

Fix any divergences. Reference: `/Users/gm/v6/docs/plans/2026-03-08-ship-a-foundation.md` task A1b.

```bash
git add src/components/layout/TopBar.tsx
git commit -m "fix(topbar): align to reference spec — breadcrumb, search, gap"
```

### Task 1.2: Audit NotificationsBell dropdown

Read `src/components/layout/NotificationsBell.tsx`. Check:
- [ ] Dropdown: width 320px, border-radius 12px, `shadow: 0 8px 24px rgba(0,0,0,0.12)`
- [ ] Header: padding `12px 16px`, border-bottom `rgba(0,0,0,0.06)`, "Mark all as read" 12px accent
- [ ] Group label: 10px, uppercase, letter-spacing 0.08em, `rgba(100,116,139,0.7)`
- [ ] Item: padding `10px 16px`, 13px, hover `bg rgba(0,0,0,0.03)`

Fix any divergences.

```bash
git add src/components/layout/NotificationsBell.tsx
git commit -m "fix(notif-bell): align dropdown to reference spec"
```

### Task 1.3: Audit SidebarUserCard

Read `src/components/layout/sidebar/SidebarUserCard.tsx`. Check:
- [ ] Uses `dashboard.getDisplayUser` tRPC query for real user data
- [ ] Flat card with divider above sign-out
- [ ] Shows full name + role label + avatar

Verify `getDisplayUser` procedure exists and returns `{ fullName, email, role, initials }`:

```bash
grep -n "getDisplayUser" src/server/routers/dashboard.ts
```

Fix any gaps.

```bash
git add src/components/layout/sidebar/SidebarUserCard.tsx src/server/routers/dashboard.ts
git commit -m "fix(sidebar): SidebarUserCard uses real user data via getDisplayUser"
```

### Task 1.4: Run check

```bash
npm run check
```

Expected: all pass. Fix any failures before marking done.

```bash
git add -p
git commit -m "fix(shell): npm run check clean"
```

---

## Wave 1, Agent 2: w1-primitives (A1c)

**Worktree:** `/Users/gm/doculet-app/.worktrees/w1-primitives`
**Branch:** `phase-a/w1-primitives`

**State check first:** Many primitives exist. Check each against the pixel spec from `ship-a-foundation.md` A1c steps 1-12.

### Task 2.1: Audit stat cards

Check `src/components/ui/stat-card.tsx`:
- Label: 10px, UPPERCASE, letter-spacing 0.09em, `#94A3B8`, margin-bottom 10px
- Value: 24px, weight 700, `#0F172A`, letter-spacing `-0.025em` (IBM Plex Mono for amounts)
- FX rate: IBM Plex Mono, 11px, `rgba(100,116,139,0.7)`
- Card: bg `#fff`, border-radius 12px, padding `18px 16px`, border `1px solid rgba(0,0,0,0.07)`

```bash
git add src/components/ui/stat-card.tsx
git commit -m "fix(stat-card): pixel-match reference spec"
```

### Task 2.2: Audit data table

Check `src/components/ui/table.tsx`:
- `th`: 10px, uppercase, letter-spacing 0.08em, `rgba(15,23,42,0.35)`, padding `10px 16px 8px`
- `td`: padding `12px 16px`, 13px, `#334155`, border-bottom `rgba(0,0,0,0.05)`
- `tr:hover`: `background rgba(241,240,236,0.5)`
- Mono cells: font-mono, 12.5px

```bash
git add src/components/ui/table.tsx
git commit -m "fix(table): pixel-match reference spec"
```

### Task 2.3: Audit status badges

Check `src/components/ui/status-badge.tsx` or badge variants:
- pending: `bg rgba(0,0,0,0.06)`, `color rgba(15,23,42,0.50)` — use semantic `bg-muted text-muted-foreground`
- under_review: `bg #FEF3C7`, `color #92400E` — `bg-warning/10 text-warning`
- approved: `bg #DCFCE7`, `color #15803D` — `bg-success/10 text-success`
- rejected: `bg #FEE2E2`, `color #DC2626` — `bg-destructive/10 text-destructive`
- Base: padding `3px 9px`, border-radius 20px, 11px, weight 600

**CRITICAL:** No raw Tailwind color classes (`bg-emerald-*`, `bg-amber-*`). Use semantic tokens only.

```bash
git add src/components/ui/status-badge.tsx
git commit -m "fix(status-badge): semantic tokens only, pixel-match spec"
```

### Task 2.4: Audit verification tier cards

Check `src/components/student/` for tier card component:
- Card: bg `#fff`, border `1px solid rgba(0,0,0,0.07)`, border-radius 12px, padding `16px 18px`
- Locked state: opacity 0.55 (no lock icon)
- Icon container: 36×36, border-radius 10px
  - done: `bg #DCFCE7`, `color #15803D`
  - active: `bg #DBEAFE`, `color #1D4ED8`
  - locked: `bg rgba(0,0,0,0.06)`, `color rgba(15,23,42,0.35)`
- CTA: 12px, weight 600, accent, `bg rgba(43,57,163,0.07)`, border-radius 7px

```bash
git commit -m "fix(tier-cards): pixel-match spec, opacity for locked state"
```

### Task 2.5: Audit banking choice cards (T3)

Check for banking choice card component (two equal options: Mono connect vs upload):
- Grid: 2 columns, gap 12px
- Each: border `2px rgba(0,0,0,0.08)`, border-radius 14px, padding `20px 18px`
- Hover: border-color accent, `translateY(-1px)`, shadow
- Selected: border-color accent, `bg rgba(43,57,163,0.03)`
- Both options are first-class (no "fallback" framing)

Create or fix as needed.

```bash
git commit -m "fix(banking-choice): two first-class options, pixel-match spec"
```

### Task 2.6: Audit OCR review card

Check for OCR review card component (inline below uploaded file):
- Header: `bg #FFFBEB`, border-bottom, amber icon + title
- Fields: editable inputs for name, account number, bank name, balance
- Student confirms before submitting

```bash
git commit -m "fix(ocr-card): inline review card spec"
```

### Task 2.7: Audit upload zone

Check `src/components/ui/file-uploader.tsx` or similar:
- Border: `2px dashed rgba(0,0,0,0.15)`, border-radius 12px, padding `32px 20px`
- Hover/drag: border-color accent, `bg rgba(43,57,163,0.02)`
- Preview + confirm before upload begins (never auto-upload on file selection)

```bash
git commit -m "fix(upload-zone): dashed border spec, confirm before upload"
```

### Task 2.8: Audit funding type cards

Check the onboarding funding type selection cards:
- Relational labels: "I am paying for my education", "Someone is sponsoring me", "A company is sponsoring me"
- Selected: border-color accent, `bg rgba(43,57,163,0.05)`
- Icon: 38×38, selected: `bg accent, color #fff`

```bash
git commit -m "fix(funding-cards): relational labels, selected state spec"
```

### Task 2.9: Run check

```bash
npm run check
```

Fix any failures.

```bash
git commit -m "fix(primitives): npm run check clean"
```

---

## Wave 1, Agent 3: w1-auth (A2 + A3)

**Worktree:** `/Users/gm/doculet-app/.worktrees/w1-auth`
**Branch:** `phase-a/w1-auth`

**State check first:** Magic link UI exists in login page. Invite links (`/join/[slug]`, `/verify/`) exist. Verify they work end-to-end.

### Task 3.1: Audit magic link auth UI

Read `src/app/(auth)/login/login-page-client.tsx`. Verify:
- [ ] Magic link tab/toggle is present alongside password login
- [ ] `signInWithOtp` called with email
- [ ] Success message shown after sending (not redirect)
- [ ] Error message uses copy from `src/config/copy/auth.ts` (`authCopy.magicLink.*`)
- [ ] No hardcoded strings

Fix any gaps.

```bash
git add src/app/(auth)/login/login-page-client.tsx src/config/copy/auth.ts
git commit -m "fix(auth): magic link UI — copy compliance, error states"
```

### Task 3.2: Audit auth callback + complete flow

Read `src/app/(auth)/auth/complete/` and `src/app/(auth)/auth/callback/`. Verify:
- [ ] Magic link token verified
- [ ] Redirect to `/dashboard/[role]` on success
- [ ] Error state shown on invalid/expired token
- [ ] No raw `fetch()` — uses tRPC or Supabase client

```bash
git add src/app/\(auth\)/auth/
git commit -m "fix(auth): callback/complete flow — error states, redirect"
```

### Task 3.3: Audit invite link system

Read `src/app/(marketing)/join/[slug]/page.tsx` and `src/app/(marketing)/verify/page.tsx`. Verify:
- [ ] Invite token validated server-side
- [ ] Role determined from invite type (agent/partner/university)
- [ ] Pre-fills signup form with invited email
- [ ] Expired/invalid token shows error state (not crash)
- [ ] Uses tRPC procedure for invite validation

Check invite procedures:
```bash
grep -rn "validateInvite\|getInvite\|inviteToken" src/server/routers/
```

Fix any gaps.

```bash
git commit -m "fix(invite): token validation, error states, role detection"
```

### Task 3.4: Run check

```bash
npm run check
```

```bash
git commit -m "fix(auth): npm run check clean"
```

---

## Wave 1, Agent 4: w1-payments (A4 + A5)

**Worktree:** `/Users/gm/doculet-app/.worktrees/w1-payments`
**Branch:** `phase-a/w1-payments`

**State check first:** Paystack webhook handler likely already complete. Disbursement button wiring needs verification.

### Task 4.1: Verify Paystack webhook handler

Read `src/app/api/webhooks/paystack/route.ts`. Verify:
- [ ] Signature verification: `X-Paystack-Signature` HMAC-SHA512 check with `timingSafeEqual`
- [ ] `charge.success` handler: marks certificate payment confirmed, updates cert status
- [ ] `transfer.success` handler: marks disbursement sent, sends sponsor + student email
- [ ] `transfer.failed` handler: marks disbursement failed, sends failure emails
- [ ] All handlers wrapped in try/catch, return 200 always (Paystack retry on 4xx/5xx)
- [ ] Audit log entry for each event

If all checks pass, move on. If gaps found, fix them.

```bash
git add src/app/api/webhooks/paystack/
git commit -m "fix(webhook): paystack handler — all 3 events, signature verify, audit log"
```

### Task 4.2: Verify disbursement button wiring

Find the sponsor disbursement initiation UI. Check:
- [ ] Button calls `sponsor.initiateDisbursement` tRPC mutation
- [ ] Confirmation modal before initiating: "You are committing ₦ X to [Name]'s application. This is not a payment."
- [ ] Loading state on button during mutation
- [ ] Error state shown inline (not toast)
- [ ] Success: status updates without page reload

Check the sponsor students page for the disbursement trigger:
```bash
grep -rn "initiateDisbursement\|disbursement" src/app/dashboard/\[role\]/students/
```

Fix any gaps.

```bash
git commit -m "fix(disbursement): button wired, confirmation modal, inline error"
```

### Task 4.3: Run check

```bash
npm run check
```

```bash
git commit -m "fix(payments): npm run check clean"
```

---

## Wave 1, Agent 5: w1-cert (A6)

**Worktree:** `/Users/gm/doculet-app/.worktrees/w1-cert`
**Branch:** `phase-a/w1-cert`

**State check first:** `src/app/api/certificate/[token]/pdf/route.ts` exists with react-pdf. Verify all 5 required elements are present.

### Task 5.1: Verify certificate PDF content

Read `src/app/api/certificate/[token]/pdf/route.ts` and `src/lib/certificate-pdf.tsx` (or similar). Verify all required elements:

- [ ] Student legal full name (from KYC, not signup name)
- [ ] School name + program
- [ ] NGN amount in IBM Plex Mono font
- [ ] Cert ID format: `DOC-2026-XXXXX`
- [ ] Issue date + expiry date
- [ ] Public verification URL (`/certificate/[token]`)
- [ ] QR code — bottom-right corner, links to verification URL
- [ ] Doculet seal — bottom-left corner
- [ ] Diagonal watermark text

```bash
grep -n "qr\|QR\|seal\|watermark" src/lib/certificate-pdf.tsx 2>/dev/null || find src -name "certificate-pdf*"
```

### Task 5.2: Fix any missing PDF elements

For any missing element, implement it. Common gaps:
- QR code: use `qrcode` or `qrcode.react` (server-side)
- Watermark: diagonal `Transform` with opacity 0.06 in react-pdf
- Doculet seal: base64-encode the seal PNG and embed as `<Image>`

```bash
git add src/lib/certificate-pdf.tsx src/app/api/certificate/
git commit -m "fix(cert-pdf): QR code, seal, watermark — all 5 elements verified"
```

### Task 5.3: Verify public certificate verification page

Read `src/app/certificate/[token]/page.tsx`. Verify:
- [ ] Shows cert ID, student name, school, program, NGN amount
- [ ] Issue + expiry date
- [ ] "Download PDF" CTA links to `/api/certificate/[token]/pdf`
- [ ] Invalid/expired token shows error state

```bash
git add src/app/certificate/
git commit -m "fix(cert): public verify page — all fields, download CTA, error state"
```

### Task 5.4: Run check

```bash
npm run check
```

```bash
git commit -m "fix(cert): npm run check clean"
```

---

## Wave 1, Agent 6: w1-emails (A7–A10)

**Worktree:** `/Users/gm/doculet-app/.worktrees/w1-emails`
**Branch:** `phase-a/w1-emails`

**State check first:** Most email templates exist. Agent referral URL is done. Verify completeness.

### Task 6.1: Verify agent referral URL

Check `src/server/routers/agent.ts`:
```bash
grep -n "referralUrl\|referral" src/server/routers/agent.ts
```

Expected: `getSettings` or similar returns `referralUrl: \`\${base}/join?ref=\${code}\``. If present and correct, this is done. If not, implement it.

```bash
git commit -m "fix(agent): referral URL stored and returned in getSettings"
```

### Task 6.2: Verify welcome email template

Read `src/lib/email/templates/welcome-email.tsx`. Verify:
- [ ] Uses first name only in greeting: "Welcome, {firstName}"
- [ ] Explains what Doculet does (proof of funds, not generic SaaS)
- [ ] CTA: "Start your application" linking to `/dashboard/student`
- [ ] No emojis
- [ ] No hardcoded strings (uses template props)
- [ ] No stated SLA or timeline promises

```bash
git add src/lib/email/templates/welcome-email.tsx src/lib/email/send-welcome-email.ts
git commit -m "fix(email): welcome template — copy compliance, no SLA promises"
```

### Task 6.3: Verify password reset email

Supabase handles the password reset email delivery. Verify the Supabase email template is customised (if configured):
```bash
ls supabase/templates/ 2>/dev/null
```

If custom template exists, verify it matches brand voice. If using Supabase default, this is acceptable — note it as done.

```bash
git commit -m "fix(email): password reset — Supabase template verified"
```

### Task 6.4: Verify disbursement confirmation emails

Read `src/lib/email/templates/disbursement-sent-email.tsx` and `disbursement-failed-email.tsx`. Verify each:
- [ ] Exact NGN amount (IBM Plex Mono style note for plain text)
- [ ] No stated timeline ("funds are on their way" not "within 2 hours")
- [ ] Error email: states failure reason + action to take
- [ ] Send functions exist: `send-disbursement-sent-email.ts`, `send-disbursement-failed-email.ts`
- [ ] Called from Paystack webhook handler on relevant events

```bash
git add src/lib/email/templates/disbursement-*.tsx
git commit -m "fix(email): disbursement templates — copy compliance, no timeline promises"
```

### Task 6.5: Run check

```bash
npm run check
```

```bash
git commit -m "fix(emails): npm run check clean"
```

---

## Wave 1 Merge Procedure (Orchestrator)

After all 6 agents signal completion:

```bash
cd /Users/gm/doculet-app

# Merge in order: shell first, primitives second, rest in any order
git checkout main
git merge phase-a/w1-shell --no-ff -m "merge(phase-a): w1-shell — sidebar + topbar"
npm run check  # Fix any issues before continuing

git merge phase-a/w1-primitives --no-ff -m "merge(phase-a): w1-primitives — content primitives"
npm run check

git merge phase-a/w1-auth --no-ff -m "merge(phase-a): w1-auth — magic link + invite links"
npm run check

git merge phase-a/w1-payments --no-ff -m "merge(phase-a): w1-payments — Paystack + disbursement"
npm run check

git merge phase-a/w1-cert --no-ff -m "merge(phase-a): w1-cert — certificate PDF"
npm run check

git merge phase-a/w1-emails --no-ff -m "merge(phase-a): w1-emails — referral URL + email templates"
npm run check
```

Once all 6 are merged and `npm run check` is green: **launch Wave 2.**

```bash
git worktree add .worktrees/w2-mobile-tab  -b phase-a/w2-mobile-tab
git worktree add .worktrees/w2-mobile-375  -b phase-a/w2-mobile-375
```

---

## Wave 2, Agent 7: w2-mobile-tab (A11)

**Worktree:** `/Users/gm/doculet-app/.worktrees/w2-mobile-tab`
**Branch:** `phase-a/w2-mobile-tab`

**State check first:** `src/components/layout/BottomTabBar.tsx` exists. Verify spec compliance.

### Task 7.1: Audit BottomTabBar

Read `src/components/layout/BottomTabBar.tsx`. Verify:
- [ ] 4 items per role (Overview + 2 role-specific + Settings)
- [ ] Active item uses `var(--role-accent)` color
- [ ] Inactive items: `text-muted-foreground`
- [ ] Touch targets: `min-h-[56px]` (bottom bar) with at least 44px tap areas
- [ ] iOS safe-area: `pb-[env(safe-area-inset-bottom)]` or `pb-safe`
- [ ] Hidden at `md:` and above: `md:hidden`
- [ ] Mounted in `src/app/dashboard/[role]/layout.tsx` (not inside Sidebar)

Check layout.tsx wiring:
```bash
grep -n "BottomTabBar\|MobileTabBar" src/app/dashboard/\[role\]/layout.tsx
```

### Task 7.2: Fix any gaps

Common issues:
- Tab bar not wired into layout → add to `layout.tsx` inside dashboard shell, below page content
- Missing safe-area padding → add `pb-[env(safe-area-inset-bottom)]`
- Wrong number of tabs → check `src/config/nav/` for each role's mobile keys

```bash
git add src/components/layout/BottomTabBar.tsx src/app/dashboard/\[role\]/layout.tsx
git commit -m "fix(mobile-tab): safe-area, role-accent active, 44px targets, md:hidden"
```

### Task 7.3: Visual check at 375px

```bash
npm run dev
```

Open browser at 375px width. Check all 6 roles:
- `/dashboard/student` → student tabs
- `/dashboard/sponsor` → sponsor tabs
- `/dashboard/admin` → admin tabs
- `/dashboard/university` → university tabs
- `/dashboard/agent` → agent tabs
- `/dashboard/partner` → partner tabs

Fix any visual issues.

```bash
git commit -m "fix(mobile-tab): 375px verified all 6 roles"
```

### Task 7.4: Run check

```bash
npm run check
```

```bash
git commit -m "fix(mobile-tab): npm run check clean"
```

---

## Wave 2, Agent 8: w2-mobile-375 (A12)

**Worktree:** `/Users/gm/doculet-app/.worktrees/w2-mobile-375`
**Branch:** `phase-a/w2-mobile-375`

### Task 8.1: Audit student overview at 375px

```bash
npm run dev
```

Open `/dashboard/student` at 375px. Check:
- [ ] No horizontal scroll
- [ ] All stat cards stack vertically
- [ ] Progress tracker readable
- [ ] All buttons `min-h-[44px]`
- [ ] Text doesn't overflow containers

Fix any issues in `src/app/dashboard/[role]/_components/student-overview.tsx`.

```bash
git add src/app/dashboard/\[role\]/_components/student-overview.tsx
git commit -m "fix(mobile-375): student overview — no overflow, 44px targets"
```

### Task 8.2: Audit student setup page at 375px

Open `/dashboard/student/setup` at 375px. Check:
- [ ] Funding type cards stack (not side-by-side)
- [ ] Form inputs `min-h-[44px]`
- [ ] Submit button full-width on mobile
- [ ] No horizontal scroll

```bash
git add src/app/dashboard/\[role\]/onboarding/
git commit -m "fix(mobile-375): student setup page — stacked cards, full-width CTA"
```

### Task 8.3: Audit student verification page at 375px

Open `/dashboard/student/verification` (or `/dashboard/[role]/verification`) at 375px. Check:
- [ ] Tier cards stack vertically (not side-by-side)
- [ ] Banking choice cards stack vertically at 375px
- [ ] All CTAs `min-h-[44px]`, full-width
- [ ] Progress bar readable
- [ ] No horizontal scroll

```bash
git add src/app/dashboard/\[role\]/verification/
git commit -m "fix(mobile-375): verification page — stacked tiers, full-width CTAs"
```

### Task 8.4: Audit student documents page at 375px

Open `/dashboard/[role]/documents` at 375px. Check:
- [ ] Document list is single-column
- [ ] Upload zone full-width
- [ ] Action buttons visible (not clipped)
- [ ] OCR review card stacks properly

```bash
git add src/app/dashboard/\[role\]/documents/
git commit -m "fix(mobile-375): documents page — single-column, upload zone"
```

### Task 8.5: Audit student proof page at 375px

Open `/dashboard/[role]/proof` at 375px. Check:
- [ ] Certificate card full-width
- [ ] "Share" CTA prominent (WhatsApp first on mobile)
- [ ] "Download PDF" secondary on mobile
- [ ] Share options stack vertically

```bash
git add src/app/dashboard/\[role\]/proof/
git commit -m "fix(mobile-375): proof page — WhatsApp primary, share options stack"
```

### Task 8.6: Run check

```bash
npm run check
```

```bash
git commit -m "fix(mobile-375): npm run check clean"
```

---

## Wave 2 Merge Procedure (Orchestrator)

```bash
cd /Users/gm/doculet-app

git checkout main
git merge phase-a/w2-mobile-tab --no-ff -m "merge(phase-a): w2-mobile-tab — MobileTabBar all roles"
npm run check

git merge phase-a/w2-mobile-375 --no-ff -m "merge(phase-a): w2-mobile-375 — 375px student verification"
npm run check
```

---

## Phase A Completion Gate

Phase A is complete when all of the following pass:

```bash
cd /Users/gm/doculet-app
npm run check   # lint + typecheck + tests + layout-check
```

- [ ] No raw Tailwind color classes (`bg-emerald-*`, `bg-amber-*`, `text-green-*`) in any modified file
- [ ] All touch targets `min-h-[44px]` or `min-h-[56px]` for tab bar
- [ ] `BottomTabBar` renders at 375px for all 6 roles
- [ ] Certificate PDF generates with QR + seal + watermark
- [ ] Paystack webhook handles all 3 event types
- [ ] Email templates: no SLA promises, no emojis, no hardcoded strings

**Phase B begins after Phase A completion gate passes.**
