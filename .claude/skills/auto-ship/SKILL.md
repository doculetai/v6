---
name: auto-ship
description: Autonomous build-to-ship pipeline. Reads a plan file, dispatches parallel worktree subagents for independent tasks, enforces npm run check after every edit, runs product-owner gate (GO required to proceed), then polish + PR. Use when all permissions are granted and the plan is written. Invoke with /auto-ship [plan-file].
user-invokable: true
args:
  - name: plan
    description: Path to plan file (e.g. docs/plans/2026-03-06-feature.md). Defaults to latest in docs/plans/.
    required: false
---

# Auto-Ship — Autonomous Build to PR

**Announce at start:** "Using auto-ship to build and ship [feature name] autonomously."

You have full permission to build, test, commit, and open a PR without asking for confirmation. All permissions are pre-granted.

## Phase 1: Read and Parse the Plan

1. Find the plan file:
   - If an arg was provided, use it
   - Otherwise: `ls -t docs/plans/*.md | head -1` to find the latest
2. Read the full plan. Extract:
   - Feature name and goal
   - Task list with dependency graph (tasks that can run in parallel vs must be sequential)
   - Tech stack: tRPC procedures, Drizzle schema, Next.js pages, copy configs, tests

**Classify tasks:**
- **Independent** (no shared files, no data dependencies): run in parallel as background worktree subagents
- **Sequential** (depends on prior task output): run in main context after deps complete

## Phase 2: Dispatch Parallel Subagents

For each independent task, use the **Agent tool** with these parameters:

```
subagent_type: "doculet-builder"
run_in_background: true
model: "sonnet"
prompt: |
  ## Task: [task name]

  [paste full task description from the plan]

  ## Acceptance Criteria
  - [list specific outputs: files, procedures, tests]
  - Run `npm run check` before finishing — must pass clean
  - Run `npm run layout-check` if any dashboard pages were touched
  - Commit each logical unit: git add [specific files] && git commit -m "type(scope): message"

  ## When Done
  Report: files created/modified, tRPC procedures added, tests written, npm run check status, commit hashes.
```

The doculet-builder agent already knows the full Doculet stack (layout primitives, copy config, Phosphor icons, strict TypeScript, no emojis). Do NOT repeat conventions in the prompt — only provide the task-specific instructions.

Dispatch all independent tasks simultaneously. Do not wait for one before starting another.

## Phase 3: Sequential Tasks

After all parallel subagents complete, collect their results (files changed, commit hashes).

For tasks that depend on prior output, run them in main context:
- Use the same doculet-builder conventions (layout primitives, copy config, strict TS)
- Run `npm run check` after every edit
- Commit each logical unit with specific file adds

Note: subagents cannot spawn subagents. All orchestration and skill invocations (Phase 5-6) must happen in main context.

## Phase 4: Integration Check

After all tasks complete:

```bash
npm run check
```

If it fails:
- Read the errors
- Fix them directly (do not spawn a new subagent for this)
- Re-run until clean

```bash
npm run layout-check
```

Fix any violations in dashboard pages.

## Phase 5: Product-Owner Gate

Invoke the product-owner skill:

```
/product-owner
```

**If GO:** proceed to Phase 6.

**If NO-GO:** read each finding carefully, then:
- Copy Voice → invoke `/clarify` on affected copy
- Visual Quality → invoke `/audit` then `/normalize`
- User Journey gaps → invoke `/harden`
- Fix ALL findings before re-running `/product-owner`
- Re-run until GO verdict

Do not open a PR until product-owner returns GO.

## Phase 6: Polish Pass

Invoke the polish skill:

```
/polish
```

Fix everything it flags. Re-run `npm run check` after.

## Phase 7: Commit and PR

```bash
git add [all changed files — list them specifically, not git add -A]
git commit -m "feat(scope): [feature name] — [one-line summary]"
```

Then open a PR:
```bash
gh pr create --title "[Feature name]" --body "$(cat <<'EOF'
## Summary
- [bullet 1]
- [bullet 2]
- [bullet 3]

## Test plan
- [ ] npm run check passes
- [ ] layout-check clean
- [ ] product-owner returned GO
- [ ] /polish pass complete
- [ ] [feature-specific test item]
EOF
)"
```

Return the PR URL.

## Rules (Non-Negotiable)

- **No stubs, no TODOs in shipped code** — everything the plan specifies must be real
- **No `git add -A` or `git add .`** — always add specific files
- **No hardcoded strings** — all copy from `@/config/copy/`
- **No raw layout divs** — use PageShell/Section/Grid/Stack/PageHeader in dashboard pages
- **No Lucide icons** — Phosphor Duotone only
- **No emojis** — anywhere
- **product-owner GO is the merge gate** — no exceptions

## Token Efficiency

- **doculet-builder subagents** run on Sonnet (set in agent definition) — do not override
- Use **Haiku** via `model: "haiku"` for Explore subagents (file searches, grep)
- **Main context** (orchestrator) handles skill invocations, integration fixes, and PR creation
- Subagent results are summaries — do not paste full file contents back into main context
- Subagents cannot spawn subagents — all orchestration stays in main context
