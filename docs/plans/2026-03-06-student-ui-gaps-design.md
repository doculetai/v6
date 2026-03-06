# Student UI Gaps — Full Premium Upgrade
**Date:** 2026-03-06
**Status:** Approved
**Scope:** Student dashboard — onboarding, verify, proof, documents, progressive nav, smart QuickAction

---

## 1. Problem Statement

The student journey (onboarding → verify → proof → documents) is functionally complete but has
three classes of gaps:

1. **Design quality** — Raw `<select>` elements, generic card layouts, hardcoded copy, no celebration
   states. Does not meet the Premium Institutional direction confirmed in `teach-impeccable`.
2. **IA gaps** — Breadcrumbs missing on all 4 pages (Blueprint §4.1, gap A). No next-step guidance
   after terminal actions (gap C). QuickAction is not context-aware (gap K).
3. **Nav gaps** — No progressive disclosure in student sidebar (Blueprint §8.1, gap B). Students see
   "Proof of Funds" before they can use it.

---

## 2. Design

### 2.1 Journey Frame

```
SIGNUP → ONBOARDING → VERIFY → DOCUMENTS → PROOF → SHARE
             ↑            ↑          ↑          ↑
           [A,C]        [A]        [A,C]      [A,C]
         [Design]     [Design]
              [B: progressive nav]
              [K: smart QuickAction]
```

Gap codes reference `docs/plans/2026-03-05-ia-navigation-blueprint.md §11`.

---

### 2.2 Onboarding (`/dashboard/student/onboarding`)

**Breadcrumbs:** `Overview > Application Setup`

**Welcome step (step 1):**
- Large heading from `onboardingCopy.steps.welcome.title`
- Three checklist highlights with Phosphor Duotone icons:
  - ShieldCheck — identity verification
  - FileText — document upload
  - Trophy — proof of funds certificate
- Warm, reassuring tone. Primary CTA button full-width on mobile.
- Background: card surface with subtle left-border accent in student blue `#2B39A3`.

**School + Program step (step 2):**
- Replace raw `<select>` with shadcn `<Select>` component for both school and program.
- Program select is disabled + shows placeholder until school is chosen.

**Funding Type step (step 3):**
- Replace raw `<select>` with shadcn `<Select>` component.
- Keep existing `FundingTypeOption` radio cards — they are already premium in style.

**Summary + Complete step (step 4):**
- Summary table stays (dl/dt/dd pattern is correct).
- On `onboardingComplete: true`: show celebration state.
  - `CheckCircle` icon in primary color (large, 32px).
  - Warm success heading + description from copy config.
  - Prominent next-step CTA: "Begin your verification" → `/dashboard/student/verify`.
  - Secondary CTA: "Go to overview" → `/dashboard/student`.

---

### 2.3 Verify (`/dashboard/student/verify`)

**Breadcrumbs:** `Overview > Identity & Bank`

**Form selects:**
- Replace `<select id="verify-tier">` with shadcn `<Select>`.
- Replace `<select id="identity-type">` with shadcn `<Select>`.

**Hardcoded copy — move to `studentCopy.verify`:**
- `"Upload a bank statement instead"` → `copy.bankSection.uploadAlternativeCta`
- `"or"` divider label → `copy.bankSection.orDivider`
- `"Tier 2"` / `"Tier 3"` option labels → `copy.kycSection.tierOptions.tier2` / `.tier3`

**Bank section — Mono connection:**
- When not connected: replace raw account ID input with a CTA button "Connect your bank account"
  that will trigger the Mono widget (or navigate to the Mono flow). Raw ID input stays as
  dev-only fallback behind an `isDev` flag or environment check.
- Rationale: real users won't know their Mono account ID. The input is a developer shortcut.

**Tier cards:**
- Remove hardcoded `"Tier ${tierItem.tier}"` string.
- Use `copy.kycSection.tiers[index].label` (already defined in copy config).

---

### 2.4 Proof (`/dashboard/student/proof`)

**Breadcrumbs:** `Overview > Proof of Funds`

**Certificate card (issued state):**
- Distinguished layout: IBM Plex Serif for the student name / certificate title.
- Doculet seal concept: bordered card with `ring-1 ring-primary/20` and warm shadow.
- Share CTA as primary button: "Share your certificate" (full-width on mobile).
- Secondary: "Download" (if applicable) or "View public page".

**Checklist card (not-ready state):**
- Each checklist item shows: Phosphor icon + label + status badge.
- Completed items: `CheckCircle` in success color.
- Incomplete items: `Circle` in muted color.
- Locked `Trophy` icon at bottom with muted color until all complete.

---

### 2.5 Documents (`/dashboard/student/documents`)

**Breadcrumbs:** `Overview > Documents`

**Empty state:**
- Existing `StudentDocumentsEmptyState` — confirm it has a CTA button.
- If CTA is missing: add "Upload your first document" button that scrolls to / opens the upload form.

**All-approved state (new):**
- When `documents.every(d => d.status === 'approved')` and `documents.length >= 1`:
- Show a success banner above the list:
  - `CheckCircle` icon + "All documents approved" heading.
  - CTA: "View your proof status" → `/dashboard/student/proof`.

---

### 2.6 Student Nav — Progressive Disclosure

**Source:** Blueprint §8.1

**Trust stages:**

| Stage | Condition | Nav items disabled |
|-------|-----------|-------------------|
| 0 — Not started | `onboardingComplete: false` | Verify, Documents, Proof |
| 1 — Building | `onboardingComplete: true`, proof checklist incomplete | Proof |
| 2 — Ready | All checklist items complete, no certificate | — (all enabled) |
| 3+ — Sealed/Shared | Certificate issued | — (all enabled) |

**Implementation:**
- `getNavConfig(role, options?)` in `src/config/nav/index.ts` gains optional `options.studentTrustStage: 0 | 1 | 2 | 3`.
- Student nav items for Verify, Documents, Proof gain optional `disabledBeforeStage: number` field in `NavItem`.
- `DashboardShell` / `Sidebar` computes `studentTrustStage` from session data passed down from
  `layout.tsx` (already has access to `onboardingData`).
- Disabled items: `opacity-40 pointer-events-none cursor-not-allowed` + `aria-disabled="true"`.
- Tooltip on hover: "Complete your application setup first" (stage 0) or "Complete verification steps first" (stage 1).

---

### 2.7 Student QuickAction — Context-Aware

**Source:** Blueprint gap K

**Logic (computed in `layout.tsx` server component):**

```
Stage 0 (onboardingComplete: false)
  → label: "Set up your application"
  → href: /dashboard/student/onboarding

Stage 1a (onboardingComplete: true, KYC not done)
  → label: "Complete your verification"
  → href: /dashboard/student/verify

Stage 1b (KYC done, documents not complete)
  → label: "Upload your documents"
  → href: /dashboard/student/documents

Stage 2 (all checklist complete, no certificate)
  → label: "View your proof"
  → href: /dashboard/student/proof

Stage 3+ (certificate issued)
  → label: "Share your certificate"
  → href: /dashboard/student/proof
```

`SidebarQuickAction` receives `label` and `href` as props from layout — no logic inside the component.

---

## 3. Copy Changes

All new strings go in `src/config/copy/student.ts`:

| Key path | String |
|---|---|
| `verify.bankSection.uploadAlternativeCta` | "Upload a bank statement instead" |
| `verify.bankSection.orDivider` | "or" |
| `verify.bankSection.connectMonoCta` | "Connect your bank account" |
| `verify.kycSection.tierOptions.tier2` | "Tier 2" |
| `verify.kycSection.tierOptions.tier3` | "Tier 3" |
| `onboarding.steps.action.nextStepCta` | "Begin your verification" |
| `onboarding.steps.action.overviewCta` | "Go to overview" |
| `documents.allApproved.heading` | "All documents approved" |
| `documents.allApproved.cta` | "View your proof status" |

---

## 4. Component Changes

| Component | Change |
|---|---|
| `onboarding-page-client.tsx` | Replace `<select>` × 2 with `<Select>`, add PageHeader, add celebration state |
| `verify-page-client.tsx` | Replace `<select>` × 2 with `<Select>`, fix hardcoded copy, Mono CTA button |
| `proof-page-client.tsx` | Add PageHeader, premium certificate card layout |
| `documents-page-client.tsx` | Add PageHeader, all-approved banner |
| `src/config/nav/student.ts` | Add `disabledBeforeStage` to Verify, Documents, Proof items |
| `src/config/nav/types.ts` | Add `disabledBeforeStage?: number` to `NavItem` |
| `src/config/nav/index.ts` | Accept `options.studentTrustStage`, apply disabled logic |
| `src/components/layout/Sidebar.tsx` | Render disabled state for items with `disabledBeforeStage` |
| `src/app/dashboard/[role]/layout.tsx` | Compute trust stage + QuickAction props, pass to shell |
| `src/config/copy/student.ts` | Add new strings (see §3) |

---

## 5. Out of Scope

- Sidebar collapse persistence (gap D/E) — separate task
- Missing error.tsx pages (gap R) — separate task
- Live nav badge counts (gap J) — separate task
- Mono widget integration (full SDK) — depends on Mono SDK availability
- Other roles (sponsor, admin, etc.) — follow-on after student is done

---

## 6. Success Criteria

- [ ] All 4 student journey pages have breadcrumbs
- [ ] No raw `<select>` elements remain in student journey pages
- [ ] No hardcoded copy strings in student journey pages
- [ ] Onboarding success state shows next-step CTA to verify
- [ ] Documents all-approved state shows next-step CTA to proof
- [ ] Student nav items are disabled by trust stage
- [ ] QuickAction href is context-aware by trust stage
- [ ] `npm run layout-check` passes
- [ ] `npm run check` passes (lint + typecheck + tests)
