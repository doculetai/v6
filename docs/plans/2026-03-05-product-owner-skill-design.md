# Product Owner Skill — Design Doc

**Date:** 2026-03-05
**Status:** Approved, ready for implementation

## Summary

A Doculet-specific skill that acts as a product owner sign-off gate before merging. Reads `git diff`, plan docs, and `CLAUDE.md` autonomously then produces a structured Go / No-go verdict evaluated through 6 Doculet product lenses.

## Identity

- **Name:** `product-owner`
- **User-invokable:** yes
- **Args:** `feature` (optional) — area being reviewed; inferred from diff if omitted
- **Workflow position:** After implementation, before merge — runs alongside `pr-review-toolkit:review-pr` but evaluates product intent not code quality

## Process (4 phases, fully autonomous)

### Phase 1 — Gather context
- Read `CLAUDE.md` → extract personas, roles, emotional goals, copy rules, design principles
- Read `git diff` (staged + unstaged vs main) → understand what changed
- Scan `docs/plans/` for a matching plan doc → understand original intent
- Narrow scope if `args.feature` is provided

### Phase 2 — Evaluate through 6 Doculet lenses

| Lens | What it checks |
|------|---------------|
| Persona fit | Does each changed surface match the right role's emotional goal? (warm/calm for student, trust/precision for sponsor, efficient for university) |
| Scope drift | Did the implementation go beyond or fall short of what was planned? |
| Copy compliance | Is all copy from `src/config/copy/`? Any hardcoded strings in JSX? |
| Role-awareness | Are role-gated features properly guarded? Does UI feel personalised per role? |
| Trust signals | Do financial figures, status badges, and verification states feel bank-grade? |
| Emotional goal | Does the feature land the intended emotional experience (confidence+calm or progress+achievement)? |

### Phase 3 — Produce verdict
One decisive Go / No-go with structured justification per lens. Each failing lens gets: what's wrong, impact on user, minimum fix required to ship.

### Phase 4 — Summary block
One-line overall verdict + top 3 blockers (if No-go) or top 3 observations (if Go).

## Output Format

```
## PO Review — [Feature Name]

### Context Read
- Plan doc: [found / not found]
- Diff summary: N files, N insertions, N deletions
- Personas affected: [student / sponsor / university / ...]

### Lens Review

#### Persona Fit        ✓ PASS / ✗ FAIL
[finding]

#### Scope Drift        ✓ PASS / ✗ FAIL
[finding]

#### Copy Compliance    ✓ PASS / ✗ FAIL
[finding]

#### Role-Awareness     ✓ PASS / ✗ FAIL
[finding]

#### Trust Signals      ✓ PASS / ✗ FAIL
[finding]

#### Emotional Goal     ✓ PASS / ✗ FAIL
[finding]

---

## Verdict: GO ✓  /  NO-GO ✗

[One-paragraph justification]

### Blockers (must fix before ship)
1. ...

### Observations (ship as-is, but note)
1. ...
```

## Verdict logic
- **No-go** — any lens fails and the fix is non-trivial
- **Conditional go** — all fails are minor; blockers listed with fixes
- **Go** — all lenses pass

## Skill File Location
`skills/product-owner/SKILL.md`

## Pattern reference
Modelled after `teach-impeccable` (setup-then-persist pattern), `audit` (scan-then-report, never fix), and `pr-review-toolkit` (gate before merge). Differs in that it evaluates product intent, not design quality or code correctness.
