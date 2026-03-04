# Commercial Beta Launch — Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create the implementation plan from this design.

**Goal:** Take Doculet V6 from demo/alpha to closed beta — real KYC, real payments, minimal public presence — for 5–10 hand-picked sponsors and students.

**Timeline:** ~2 weeks, parallel execution tracks.

**Approach:** Three parallel tracks running simultaneously via subagent-driven-development.

---

## Context: Current State

- Auth, role-based access, dashboard shell, all 22 pages: ✅ built
- KYC (Dojah/Mono): ❌ fake — generates UUIDs, never calls real API
- Payments (Paystack): ❌ missing — no disbursement endpoint, no webhook
- Error boundaries: ❌ only 6/22 pages have them
- Emails: ❌ only sponsor invitation email; welcome/reset/confirmation missing
- Landing page: ❌ `/` redirects to `/test-landing`
- Live credentials: ✅ all ready (Dojah, Mono, Paystack)
- Certificate issuance: manual approval in UI is fine for beta (no auto-PDF needed)

---

## Track A: Identity — Dojah + Mono

### Dojah KYC (student tier verification)

**What's broken:**
- `startDojahIdentityCheck()` in `src/server/routers/student-verification.procedures.ts` generates a fake `referenceId = dojah_${tier}_${uuid}` and never calls Dojah API.

**What to build:**
1. Replace fake reference ID with real Dojah API call:
   - Endpoint: `POST https://api.dojah.io/api/v1/kyc/bvn` (or NIN/passport equivalent)
   - Headers: `AppId: DOJAH_APP_ID`, `Authorization: DOJAH_PRIVATE_KEY`
   - Store real `referenceId` from Dojah response
2. Add webhook handler at `/api/webhooks/dojah` (or `/api/v2/webhooks/dojah`):
   - Validate HMAC signature using `DOJAH_WEBHOOK_SECRET`
   - On `verification.completed` event: update `dojah_checks.status` to `verified` or `failed`
   - On `verified`: update student profile `kycTier` field
3. Unlock Sponsor KYC Tier 2/3 buttons in `kyc-page-client.tsx` (currently `disabled` with "Coming soon")

### Mono Bank Connection (student bank linking)

**What's broken:**
- `connectMonoAccount()` accepts any string `monoAccountId` without verifying with Mono API.

**What to build:**
1. After Mono widget returns `code`, exchange for `accountId` via Mono's `/account/auth` endpoint
2. Call Mono `/accounts/{accountId}` to verify account details (name, BVN match)
3. Store verified `monoAccountId` and `monoAccountName` on student profile
4. If verification fails, return error to client with actionable message

---

## Track B: Payments — Paystack

### Disbursement initiation

**What's missing:**
- No tRPC procedure to trigger Paystack Transfer
- No webhook handler for transfer status
- Disbursements UI has no "Pay" action wired

**What to build:**
1. Add `initiateDisbursement` tRPC procedure in `src/server/routers/sponsor.ts`:
   - Input: `disbursementId`
   - Verify disbursement belongs to calling sponsor and is in `scheduled` state
   - Call Paystack `POST /transfer` API with amount (kobo), recipient code, reference
   - Update disbursement status to `processing`, store `paystackReference`
2. Add webhook handler at `/api/webhooks/paystack`:
   - Validate Paystack HMAC-SHA512 signature
   - On `transfer.success`: update disbursement to `disbursed`, record `disbursedAt`
   - On `transfer.failed` / `transfer.reversed`: update to `failed`, store failure reason
3. Wire disbursements page UI:
   - "Initiate payment" button on scheduled disbursements
   - Loading/processing state while webhook pending
   - Success/failure feedback

### Paystack recipient setup

Before transferring, Paystack requires a Transfer Recipient for each student's bank account. Add:
- `createPaystackRecipient` procedure: calls Paystack `POST /transferrecipient` with student's bank details
- Store `recipientCode` on student profile
- Call this automatically when student successfully links bank via Mono

---

## Track C: Polish & Infrastructure (parallel with A + B)

### Error boundaries — 16 missing pages

Add `error.tsx` to each of these routes using the existing pattern from `overview/error.tsx`:
- `actions/`, `activity/`, `analytics/`, `api-keys/`, `branding/`, `commissions/`
- `disbursements/`, `documents/`, `kyc/`, `onboarding/`, `pipeline/`, `risk/`
- `transactions/`, `users/`, `verify/`, `[role]/` (root redirect page)

### Transactional emails (Resend, already wired)

Add 3 email templates in `src/lib/email/`:
1. **Welcome email** — triggered on signup completion, introduces platform and next steps
2. **Password reset email** — currently broken (no template), Supabase sends reset link but app has no template
3. **Disbursement confirmation** — sent to sponsor (payment initiated) and student (funds incoming)

### Live API keys

- Swap all `.env.local` test keys → live credentials in Vercel environment variables
- Add `DOJAH_WEBHOOK_SECRET`, `PAYSTACK_WEBHOOK_SECRET` to Vercel
- Verify webhook endpoints are reachable from Dojah and Paystack dashboards

### Agent referral URL

- Generate real per-agent invite link: `https://app.doculet.ai/signup?ref={agentId}`
- Pass to `actions-page-client.tsx` (currently hardcoded `null`)
- On signup with `?ref=`, associate new user with agent in `agentStudentAssignments`

---

## Section 3: Minimal Landing Page

Replace `/` redirect to `/test-landing` with a real one-page site at `src/app/(marketing)/page.tsx`.

**Sections:**
1. **Nav** — logo + "Sign in" link
2. **Hero** — headline, 1-paragraph value prop, "Request early access" CTA
3. **How it works** — 3-step horizontal flow (Student applies → Sponsor funds → Certificate issued)
4. **Trust signals** — "Bank-grade KYC", "Instant proof of funds", "Trusted by universities"
5. **Early access form** — email input, stores to Supabase `waitlist` table (simple insert)
6. **Footer** — contact email, Privacy Policy link, Terms link (stub pages)

All copy from `src/config/copy/marketing.ts` (new file).
No external dependencies — uses existing Tailwind + shadcn/ui.

---

## What's Deferred (not beta scope)

- Auto-generated PDF certificates (manual admin approval is fine)
- Full marketing site (pricing, features pages)
- E2E test suite (add after beta)
- Admin analytics with real data (empty states are fine)
- University pipeline automation
- Partner white-label customisation

---

## Success Criteria for Beta

- [ ] Student can complete KYC (Dojah verifies identity, Mono links bank account)
- [ ] Sponsor can initiate a real fund disbursement (Paystack processes transfer)
- [ ] Student receives funds confirmation
- [ ] Admin can approve documents and mark sponsorship milestones
- [ ] No page crashes — all 22 routes have error boundaries
- [ ] `/` shows a real landing page
- [ ] Welcome and reset emails arrive in inbox
- [ ] Live API keys active, webhook signatures verified
