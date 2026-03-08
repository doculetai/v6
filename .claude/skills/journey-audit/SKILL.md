---
name: journey-audit
description: >
  Audit the student journey cohesion across all 4 required surfaces: sidebar nav
  items, overview progress tracker, quick action CTA, and email/notification copy.
  All 4 must derive from src/lib/journey/student.ts — any surface that defines
  its own labels or logic is a cohesion break. Use when adding a new journey stage,
  changing stage labels, modifying the sidebar nav, updating email templates, or
  after any change to the student overview or proof page. Trigger phrases:
  "check journey cohesion", "audit the student journey", "journey surfaces sync",
  "sidebar doesn't match", "progress tracker wrong", "stage label mismatch".
user-invokable: true
args:
  - name: role
    description: Role to audit (defaults to student — the only role with a journey model currently)
    required: false
---

# Journey Audit — Cohesion Checker

**Purpose:** Verify that all 4 journey surfaces stay in sync with the single source of truth at `src/lib/journey/student.ts`. Return a PASS or FAIL with specific line references for any cohesion breaks.

**Announce at start:** "Auditing student journey cohesion across all 4 surfaces."

## The 4 Surfaces to Check

Per CLAUDE.md, these 4 surfaces MUST all derive from `src/lib/journey/student.ts`:

| Surface | File to check |
|---------|--------------|
| Sidebar nav items | `src/config/nav/student.ts` |
| Overview progress tracker | `src/app/dashboard/[role]/_components/student-overview.tsx` |
| Quick action CTA | `src/components/ui/journey-progress.tsx` |
| Emails + notifications | `src/lib/email/templates/*.tsx` |

## Audit Steps

### Step 1: Read the source of truth

Read `src/lib/journey/student.ts` fully. Extract:
- `STAGE_ORDER` — the authoritative stage IDs
- Stage labels from `copy.stages` (read `src/config/copy/dashboard-shell.ts` for the live labels)
- `nextAction` shapes (label, description, cta, href)

### Step 2: Audit the sidebar nav

Read `src/config/nav/student.ts`. Check:
- Every stage in `STAGE_ORDER` has a corresponding nav item (or a deliberate exclusion)
- Nav item labels match the stage labels in copy config exactly
- No nav item references a stage that does not exist in the journey model

**FAIL condition:** Nav label does not match stage label — cohesion break.

### Step 3: Audit the progress tracker

Read `src/app/dashboard/[role]/_components/student-overview.tsx`. Check:
- `computeStudentJourney()` is called with data from real tRPC queries
- The journey state is not computed anywhere else (no local `completedSteps` counter)
- The 4 input booleans (`onboardingComplete`, `verificationComplete`, `documentsComplete`, `proofReady`) are derived from real data, not hardcoded

**FAIL condition:** Parallel completion logic outside `computeStudentJourney()` — cohesion break.

### Step 4: Audit the quick action CTA

Read `src/components/ui/journey-progress.tsx`. Check:
- `nextAction` comes from `JourneyState.nextAction` (passed as prop)
- No hardcoded CTA labels or hrefs inside the component
- `href` values match routes in `src/config/routes.ts`

**FAIL condition:** Hardcoded CTA or href not from journey state — cohesion break.

### Step 5: Audit email templates

Read `src/lib/email/templates/` files that reference journey stages. Check:
- Stage labels in email subjects/bodies match the stage labels from copy config
- No email says "Step 3: Upload documents" when the stage is labelled "Documents"
- Certificate-issued email uses the stage `id` or `label` from the journey model

**FAIL condition:** Email stage label does not match journey copy — cohesion break.

## Report Format

```
## Journey Audit — Student

### Surface Results

| Surface | Status | Finding |
|---------|--------|---------|
| Sidebar nav | PASS / FAIL | [specific finding or "all stage labels match"] |
| Progress tracker | PASS / FAIL | [specific finding] |
| Quick action CTA | PASS / FAIL | [specific finding] |
| Email templates | PASS / FAIL | [specific finding] |

### Verdict: PASS / FAIL

**[PASS]** — All 4 surfaces derive from the journey model. No cohesion breaks.

**[FAIL]** — [N] cohesion break(s) found:
- [Surface]: [file:line] — [specific label or logic that is out of sync]

### Remediation

For each FAIL: edit the out-of-sync surface to reference the journey model instead of its own definition.
```
