---
name: product-owner
description: Merge gate evaluation across 9 product lenses. Returns GO or NO-GO with remediation pairings. Required before any PR.
user-invokable: true
args:
  - name: scope
    description: Feature or area to evaluate (optional — defaults to recent changes)
    required: false
---

# Product Owner Review

**Purpose:** Merge gate. Evaluate the feature or recent changes across 9 lenses and return a GO or NO-GO verdict. A NO-GO blocks the PR.

**Announce at start:** "Running /product-owner review across 9 lenses."

## Before You Begin

Read the project context:
- `CLAUDE.md` — design principles, persona descriptions, brand personality, state vocabulary
- `src/config/copy/` — copy files for the relevant role(s)
- Relevant page client files and components for the feature under review
- Recent git commits if no explicit scope is given: `git log --oneline -20`

## The 9 Lenses

Evaluate each lens. For each: state the finding, rate PASS / WARN / FAIL, and if FAIL specify the remediation skill.

---

### Lens 1: Persona Fit

**Question:** Does this feature feel designed for this specific user — their emotional state, context, and goal — or does it feel generic?

**Student** — Anxious, hopeful. Needs calm confidence, clear progress, no jargon.
**Sponsor** — Cautious, needs trust signals. Needs precision, no ambiguity about money.
**University** — Busy, efficiency-first. Needs bulk ops, clear status, minimal friction.
**Admin** — Methodical, risk-aware. Needs complete information, audit trails, no surprises.
**Agent** — Entrepreneurial. Needs quick scanning, student status at a glance.
**Partner** — Technical, ROI-focused. Needs API clarity, webhook reliability, developer ergonomics.

**FAIL remediation:** `/clarify` + `/critique`

---

### Lens 2: Scope Drift

**Question:** Does this feature do exactly what was specced — no more, no less?

Check for:
- Features added that weren't requested (over-build)
- Spec requirements that are missing or incomplete (under-build)
- UI that exposes complexity the user shouldn't see

**FAIL remediation:** `/distill` (over-built) or `/harden` (under-built)

---

### Lens 3: Copy Compliance

**Question:** Is all copy sourced from `src/config/copy/`? Is any string hardcoded in JSX?

Check:
- No string literals in JSX (`"Submit"`, `"Loading..."`, etc.)
- No template strings with user-visible text in components
- Copy keys are in the correct role file (student copy in `student.ts`, not scattered)
- Error messages are precise — no "Something went wrong", no "Oops"

**FAIL remediation:** `/clarify`

---

### Lens 4: Role-Awareness

**Question:** Does the UI correctly reflect the user's role — accent colour, nav items, page heading matching sidebar label?

Check:
- Role accent used on active nav, status badges, key CTAs
- Page H1 matches the sidebar nav label exactly
- No copy or UI from another role bleeds in
- Admin-only actions are not visible to non-admins

**FAIL remediation:** `/colorize` (missing accent) or `/clarify` (wrong copy)

---

### Lens 5: Trust Signals

**Question:** Does the feature make the user feel safe and in control?

Check:
- Amounts always shown in full NGN format (`₦ 1,500,000` in IBM Plex Mono)
- Sensitive data masked (BVN/NIN last 4 digits only)
- Destructive actions have confirmation gates
- Status is always clear — never ambiguous "pending" without context
- Doculet seal / verification indicators present where relevant

**FAIL remediation:** `/harden` or `/bolder`

---

### Lens 6: Emotional Goal

**Question:** Does the feature deliver the right emotional experience for its moment?

**Confidence + Calm** — for status views, balance displays, verification state
**Progress + Achievement** — for milestone completion, certificate issuance, step completion

Check:
- Error states are matter-of-fact and precise (not apologetic, not vague)
- Success states are firm institutional acknowledgement (not celebratory, not invisible)
- Pending states convey calm process ("Under review", not "Hang tight")
- First-time empty states orient rather than abandon

**FAIL remediation:** `/delight` (achievement missing) or `/distill` (overloaded)

---

### Lens 7: Copy Voice

**Question:** Does the copy sound like Doculet — bold, modern, institutional — or does it drift toward startup casualness or clinical coldness?

Check:
- No "Oops", "Uh oh", "Sorry about that", "Hang tight", "We're working on it"
- No "Woohoo", "You're all set!", "🎉", "Amazing", "Let's go"
- Error pattern: `[What failed] · [Why] · [What to do]`
- Success pattern: State achievement plainly. Then the action.
- No emojis anywhere
- Relational sponsor language: "Someone is sponsoring me" not "Third-party sponsor"
- Review/pending: no SLA promises ("within 24 hours" is banned)

**FAIL remediation:** `/clarify`

---

### Lens 8: Visual Quality

**Question:** Does it look like a premium Nigerian fintech — Wise + Stripe level — or does it look like a generic SaaS template?

Check:
- No raw Tailwind colour classes (`text-blue-500`, `bg-gray-100`) — semantic tokens only
- No glassmorphism, gradient text, floating cards, confetti
- Phosphor Duotone icons only — correct sizes (nav 24px, inline 20px, small 16px)
- Section labels: 10-11px ALL CAPS tracked wide
- Spacing uses t-shirt sizes via layout primitives, not ad-hoc `space-y-` or `p-5`
- Tables collapse to cards on mobile
- No horizontal scroll on any viewport
- Touch targets ≥ 44×44px

**FAIL remediation:** `/audit` → `/normalize` (then `/polish` for micro-detail)

---

### Lens 9: User Journey Completeness

**Question:** Does the feature handle all realistic states a user will encounter?

For each interactive surface check:
- Loading state (skeleton, not spinner-page)
- Empty state (icon + heading + one CTA)
- Error state (precise message + recovery action)
- Success state (acknowledged, not silent)
- Locked/blocked state (visible but not clickable-grey — shows blocked card with CTA)
- Mobile state (works at 375px)

**FAIL remediation:** `/harden` or `/onboard` (for first-time empty states)

---

## Verdict Format

```
## Product Owner Review — [Feature / Scope]

### Lens Results

| Lens | Result | Finding |
|------|--------|---------|
| 1. Persona Fit | PASS / WARN / FAIL | [one line] |
| 2. Scope Drift | PASS / WARN / FAIL | [one line] |
| 3. Copy Compliance | PASS / WARN / FAIL | [one line] |
| 4. Role-Awareness | PASS / WARN / FAIL | [one line] |
| 5. Trust Signals | PASS / WARN / FAIL | [one line] |
| 6. Emotional Goal | PASS / WARN / FAIL | [one line] |
| 7. Copy Voice | PASS / WARN / FAIL | [one line] |
| 8. Visual Quality | PASS / WARN / FAIL | [one line] |
| 9. User Journey | PASS / WARN / FAIL | [one line] |

### Verdict: GO / NO-GO

**[GO]** — All lenses PASS or WARN. No FAILs. Clear to merge.

**[NO-GO]** — [N] lens(es) FAIL. Required remediation before merge:
- Lens [N] ([Name]): [specific issue] → `/skill`
- Lens [N] ([Name]): [specific issue] → `/skill`
```

## Rules

- **FAIL on any hardcoded string** — no exceptions.
- **FAIL on any emoji** in UI, copy config, or code comments.
- **FAIL on raw Tailwind colour classes** in components (not in `globals.css` or theme files).
- **WARN** for issues that are real but not blocking (e.g. a WARN on visual quality if the feature is backend-only).
- **One NO-GO is enough to block** — don't average across lenses.
- Be specific: name the file, the line, the string. Don't say "copy may be off" — quote the copy.
- If scope is broad (entire platform), sample the highest-risk surfaces: student overview, proof page, admin operations, and one new feature from recent commits.
