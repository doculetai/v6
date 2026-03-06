# Product Owner Skill — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a Doculet-specific `/product-owner` skill that acts as a PO sign-off gate — reads git diff + plan docs + CLAUDE.md and produces a structured Go / No-go verdict before merge.

**Architecture:** Single markdown skill file at `skills/product-owner/SKILL.md`. No runtime code. The skill instructs Claude to autonomously read context (CLAUDE.md, git diff, docs/plans/) then evaluate through 6 Doculet product lenses, outputting a structured verdict. Registered in `skills-lock.json` as a local skill.

**Tech Stack:** Claude Code skill system (YAML frontmatter + markdown), git diff, CLAUDE.md design context.

**Reference design:** `docs/plans/2026-03-05-product-owner-skill-design.md`

---

### Task 1: Create the skill directory and SKILL.md

**Files:**
- Create: `skills/product-owner/SKILL.md`

**Step 1: Create the directory**

```bash
mkdir -p skills/product-owner
```

**Step 2: Write `skills/product-owner/SKILL.md`**

Create the file with this exact content:

```markdown
---
name: product-owner
description: Act as a product owner reviewing completed work before merge. Reads git diff, plan docs, and project context to produce a structured Go / No-go verdict evaluated through 6 Doculet product lenses.
user-invokable: true
args:
  - name: feature
    description: The feature name or area being reviewed (optional — inferred from diff if omitted)
    required: false
---

You are acting as the product owner for Doculet.ai. A developer has completed an implementation and is requesting a sign-off before merge. Your job is to evaluate the work through a product lens — not code quality, not design quality, but **product intent and persona fit**.

## Phase 1 — Gather Context

Before evaluating anything, read:

1. **`CLAUDE.md`** — Extract: 6 role personas and their emotional goals, copy compliance rules, design principles, brand voice guidelines.
2. **`git diff main...HEAD`** (or `git diff --cached` if nothing staged) — Understand what changed: which files, which roles/routes are affected, what UI copy appears.
3. **`docs/plans/`** — Scan for a plan doc matching the feature name or recently modified files. If found, read it to understand original intent and scope.
4. **`args.feature`** — If provided, use it to narrow scope and find the matching plan doc.

Summarise what you found before proceeding:
- Which plan doc (if any) was matched
- How many files changed and which areas (routes, components, server)
- Which Doculet roles/personas are affected

## Phase 2 — Evaluate Through 6 Doculet Lenses

Evaluate the diff against each lens. Be specific — cite file names, line content, or missing elements. Do not be vague.

### Lens 1: Persona Fit
Does each changed surface match the correct role's emotional goal?
- Student: warm, encouraging, anxiety-reducing. Progress feels achievable.
- Sponsor: trust-first, precise. Numbers are exact, status is clear.
- University: efficient, authoritative. Bulk operations feel fast.
- Admin: methodical, risk-aware. Risk signals are prominent.
- Agent: entrepreneurial. Their student pipeline is actionable.
- Partner: technical, ROI-focused. API surfaces are clear.

Flag: any UI copy, empty state, error message, or loading state that doesn't match the persona's emotional context.

### Lens 2: Scope Drift
Compare what was built against the plan doc (if found) or infer intended scope from the feature name.
- Did the implementation go beyond scope? (extra features, unplanned routes)
- Did it fall short? (stubbed pages, TODO comments, missing states)
- Are there unused files or dead code that wasn't planned?

### Lens 3: Copy Compliance
All visible strings must come from `src/config/copy/` — never hardcoded in JSX.
- Scan the diff for string literals in JSX/TSX outside of copy config files.
- Check for hardcoded role names, button labels, error messages, or status text.
- Flag any `"string"` inside JSX that isn't a variable reference from copy config.

### Lens 4: Role-Awareness
The dashboard must feel personalised per role. Each role has a distinct accent colour and the interface should adapt.
- Are role-gated features (roleProcedure, conditional nav, role-tinted UI) correctly applied?
- Does the implementation handle all 6 roles it claims to support, or does it silently break for some?
- Is there any role bleed (admin UI visible to students, etc.)?

### Lens 5: Trust Signals
Doculet handles real money and verification for Nigerian students. Every financial or verification surface must feel bank-grade.
- Are monetary amounts shown in exact NGN format (not rounded, not approximate)?
- Are sensitive values (BVN, NIN, account numbers) properly masked?
- Are status badges unambiguous (verified/pending/failed — never just a colour)?
- Do error states explain what happened and what to do next?

### Lens 6: Emotional Goal
The platform has two coexisting emotional moods:
- **Confidence + Calm** — viewing status, balances, verification state
- **Progress + Achievement** — completing milestones, receiving certificates

Does the feature land the right mood? Does it celebrate forward motion while maintaining institutional composure? Or does it feel sterile, confusing, or casual (emoji, vague copy, missing confirmation)?

## Phase 3 — Produce Verdict

Format your output exactly as follows:

---

## PO Review — [Feature Name or inferred from diff]

### Context Read
- Plan doc: [filename if found, or "not found"]
- Diff summary: N files changed, N insertions, N deletions
- Personas affected: [list roles]

### Lens Review

#### Persona Fit        ✓ PASS / ✗ FAIL
[Specific finding — cite file or copy if failing]

#### Scope Drift        ✓ PASS / ✗ FAIL
[Specific finding]

#### Copy Compliance    ✓ PASS / ✗ FAIL
[Specific finding — list hardcoded strings if failing]

#### Role-Awareness     ✓ PASS / ✗ FAIL
[Specific finding]

#### Trust Signals      ✓ PASS / ✗ FAIL
[Specific finding]

#### Emotional Goal     ✓ PASS / ✗ FAIL
[Specific finding]

---

## Verdict: GO ✓  /  NO-GO ✗  /  CONDITIONAL GO ⚠

[One paragraph. Be decisive. Explain why the verdict was reached.]

### Blockers (must fix before ship)
[Only present if NO-GO or CONDITIONAL GO]
1. [What is wrong] → [Minimum fix required]
2. ...

### Observations (ship as-is, but note for next iteration)
1. ...

---

## Verdict Logic

- **GO** — all 6 lenses pass
- **CONDITIONAL GO** — 1-2 lenses fail on minor issues; blockers listed with specific fixes
- **NO-GO** — any lens fails on a significant user-facing issue; cannot ship without fixing

Be decisive. "Could be better" is not a blocker. Only block on issues that would confuse, mislead, or erode trust for the affected persona.
```

**Step 3: Verify file was created**

```bash
ls -la skills/product-owner/
cat skills/product-owner/SKILL.md | head -5
```

Expected: directory exists, SKILL.md starts with `---` YAML frontmatter.

**Step 4: Commit**

```bash
git add skills/product-owner/SKILL.md
git commit -m "feat(skills): add product-owner PO sign-off skill"
```

---

### Task 2: Register in skills-lock.json

**Files:**
- Modify: `skills-lock.json`

**Step 1: Add the local skill entry**

Open `skills-lock.json`. Add this entry inside the `"skills"` object (alphabetical order, after `"polish"`):

```json
"product-owner": {
  "source": "local",
  "sourceType": "local",
  "computedHash": ""
}
```

**Step 2: Verify JSON is valid**

```bash
python3 -c "import json; json.load(open('skills-lock.json')); print('valid')"
```

Expected: `valid`

**Step 3: Commit**

```bash
git add skills-lock.json
git commit -m "chore(skills): register product-owner as local skill"
```

---

### Task 3: Smoke test — invoke on a real recent diff

**Step 1: Check there is a recent diff to test against**

```bash
git log --oneline -5
git diff main...HEAD --stat
```

Expected: some changed files visible.

**Step 2: Invoke the skill**

In Claude Code, run:

```
/product-owner
```

Or with a feature name:

```
/product-owner feature=student-documents
```

**Step 3: Evaluate the output against the spec**

The output must contain:
- `## PO Review —` header with feature name
- `### Context Read` section with plan doc, diff summary, personas
- All 6 lens sections with PASS/FAIL
- `## Verdict:` section with GO / NO-GO / CONDITIONAL GO
- Blockers section (if not GO)
- Observations section

**Step 4: If output is malformed or incomplete**

Identify which phase failed (context gathering, lens evaluation, or output formatting) and refine the relevant section of `SKILL.md`. Re-invoke and recheck.

**Step 5: Commit any refinements**

```bash
git add skills/product-owner/SKILL.md
git commit -m "fix(skills): refine product-owner lens instructions based on smoke test"
```

---

### Task 4: Update MEMORY.md

**Files:**
- Modify: `/Users/gm/.claude/projects/-Users-gm-v6/memory/MEMORY.md`

**Step 1: Add the skill to the Plugin→Task Map section**

Find the `## Plugin→Task Map` section and add:

```
superpowers:product-owner               → PO sign-off gate before merge (Doculet-specific)
```

**Step 2: Commit**

```bash
git add /Users/gm/.claude/projects/-Users-gm-v6/memory/MEMORY.md
```

Note: memory files live outside the git repo — no commit needed. Just save.

---

## Definition of Done

- [ ] `skills/product-owner/SKILL.md` exists with valid YAML frontmatter
- [ ] `skills-lock.json` has the `product-owner` local entry
- [ ] `/product-owner` invocation produces all 6 lens sections + verdict block
- [ ] MEMORY.md updated with skill reference
