# Exhaustive Test Suite — 4-Layer Design

**Date:** 2026-03-10
**Scope:** Student role first. Pattern proven here, then expanded to admin, agent, sponsor, university, partner.

---

## Structure

```
tests/
  unit/
    brand-compliance.test.ts        # Layer C static analysis (new)
    static-routes.test.ts           # Layer A static (extend existing)
    [existing unit tests]
  e2e/
    student/
      routes.spec.ts                # Layer A — route coverage
      brand.spec.ts                 # Layer C — browser computed style
      visual.spec.ts                # Layer D — pixel-diff baselines
      interactions/
        first-session.spec.ts       # Layer B
        onboarding-complete.spec.ts
        t1-complete.spec.ts
        t2-complete.spec.ts
        verification-complete.spec.ts
        ocr-review.spec.ts
        document-rejected.spec.ts
        documents-complete.spec.ts
        under-final-review.spec.ts
        proof-ready.spec.ts
      __screenshots__/              # Layer D committed baselines
    admin/                          # empty — ready for Phase 2
    [existing e2e specs]
```

---

## Layer A — Full Route Coverage

### A1 Static unit (extend `tests/unit/static-routes.test.ts`)
- Import `studentNavConfig.items` from `src/config/nav/student.ts`
- For each item, assert `.href` maps to a real `page.tsx` on disk
- Zero runtime cost, runs in CI pre-push

### A2 E2E (`tests/e2e/student/routes.spec.ts`)
One `test()` per nav item — 6 total:
- `Overview` → `/dashboard/student`
- `Onboarding` → `/dashboard/student/setup`
- `Verification` → `/dashboard/student/verification`
- `Documents` → `/dashboard/student/documents`
- `Proof of Funds` → `/dashboard/student/proof`
- `Settings` → `/dashboard/student/settings`

Each test:
1. `page.goto(href)` as authenticated student
2. Assert no redirect to `/login`
3. Assert `<h1>` text matches nav `label` exactly (CLAUDE.md: H1 must match sidebar nav label)
4. Assert `<main>` is visible
5. Assert `"Something went wrong"` is absent

---

## Layer B — Interaction Coverage (Full State Matrix)

Source of truth: `src/lib/journey/student.ts` — `StudentJourneyInput` drives all state.

### 10 state files

| File | State | Primary page | Key assertion |
|------|-------|-------------|---------------|
| `first-session.spec.ts` | All false | `/dashboard/student` | "Begin your application" card visible; all 4 stages `upcoming`; nextAction CTA = "Set up your profile" |
| `onboarding-complete.spec.ts` | onboarding=true | Overview | Stage 1 `completed`, Stage 2 `current`, CTA = "Continue verification" |
| `t1-complete.spec.ts` | Phone verified | Verification | T1 ticked, T2 expanded as current, T3 dimmed (50% opacity) |
| `t2-complete.spec.ts` | KYC done | Verification | T1+T2 ticked, T3 expanded — choice cards (Mono vs upload) visible |
| `verification-complete.spec.ts` | All 3 tiers done | Overview | Stage 2 `completed`, Stage 3 `current`, CTA = "Upload statement" |
| `ocr-review.spec.ts` | Statement uploaded | Documents | OCR review card visible inline, 4 editable fields, "Confirm and submit" CTA |
| `document-rejected.spec.ts` | Doc rejected | Documents | Rejection card with admin note visible; "Resubmit" CTA; no countdown copy |
| `documents-complete.spec.ts` | documents=true | Overview | All 4 stages green; proof page CTA visible |
| `under-final-review.spec.ts` | Cert in preparation | Proof | "Under final review" message; no action CTA; no SLA copy |
| `proof-ready.spec.ts` | proofReady=true | Proof | H1 "Proof of Funds Certificate"; "Download PDF" + "Share" CTAs; History tab present |

### Per-spec pattern
1. Load typed Drizzle fixture seeding that exact DB state (no mocks — `tests/fixtures/`)
2. Navigate to primary page for that state
3. Assert journey tracker stage statuses match expected values
4. Assert `nextAction` CTA label matches `src/lib/journey/student.ts` (journey cohesion)
5. Click primary CTA — assert navigation or sheet open

---

## Layer C — Brand/Design Compliance

### C1 Static analysis (`tests/unit/brand-compliance.test.ts`)

Scans all `src/**/*.tsx` and `src/config/copy/**/*.ts`.

| Group | Forbidden pattern |
|-------|------------------|
| Status colors | `text-green-*`, `bg-emerald-*`, `text-amber-*`, `bg-amber-*`, `bg-red-*`, `text-red-*` in className |
| Hardcoded hex in JSX | Hex color strings (`#[0-9A-Fa-f]{3,6}`) inside className attribute values |
| Non-Phosphor icons | Any import from `lucide-react`, `@heroicons/*`, `react-icons/*` |
| Section label length | `overline` prop value containing more than 2 words |
| Emoji in copy | Unicode emoji ranges in `src/config/copy/**` files |
| Hardcoded UI strings | Student/sponsor-facing literal sentences in `.tsx` files outside copy config |

### C2 Browser computed style (`tests/e2e/student/brand.spec.ts`)

Navigate to `/dashboard/student` as authenticated student. Four `getComputedStyle` assertions:

1. **Role accent** — active sidebar nav link `border-left-color` = `rgb(43, 57, 163)` (student `#2B39A3`)
2. **Body font** — `document.body` `font-family` contains `"IBM Plex Sans"`
3. **Mono amounts** — `.font-mono` or `[data-testid="amount"]` elements have `font-family` containing `"IBM Plex Mono"`
4. **CSS variable** — `getComputedStyle(documentElement).getPropertyValue('--role-accent')` = `#2B39A3`

---

## Layer D — Visual Regression

### `tests/e2e/student/visual.spec.ts`

8 pixel-perfect baseline screenshots. Zero pixel diff tolerance.

| Screenshot | Page | State |
|-----------|------|-------|
| `overview-first-session.png` | `/dashboard/student` | All false |
| `overview-onboarding-complete.png` | `/dashboard/student` | Onboarding done |
| `overview-proof-ready.png` | `/dashboard/student` | All complete |
| `verification-t2-complete.png` | `/dashboard/student/verification` | T1+T2 done |
| `documents-ocr-review.png` | `/dashboard/student/documents` | OCR review card |
| `documents-rejected.png` | `/dashboard/student/documents` | Doc rejected |
| `proof-under-final-review.png` | `/dashboard/student/proof` | Under final review |
| `proof-cert-ready.png` | `/dashboard/student/proof` | Cert issued |

### Infrastructure

**Playwright config additions:**
```ts
expect: {
  toHaveScreenshot: { maxDiffPixels: 0 },
},
snapshotPathTemplate: 'tests/e2e/{testFilePath}/__screenshots__/{arg}{ext}',
```

**New Playwright project:**
```ts
{
  name: 'visual',
  testMatch: /student\/visual\.spec\.ts/,
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    storageState: 'tests/e2e/.auth/student.json',
  },
  dependencies: ['setup'],
}
```

**Before each screenshot:**
1. `await page.waitForLoadState('networkidle')` — fonts and images settled
2. Mask dynamic content: `[data-testid="timestamp"]`, notification badge counts, relative dates
3. Viewport pinned to 1440×900 in the visual project

**Update workflow** (`package.json`):
```json
"test:e2e:update-snapshots": "playwright test --project=visual --update-snapshots"
```

Baselines live at `tests/e2e/student/__screenshots__/` and are committed to git. Updating requires explicit intent via the npm script — never auto-updated.

---

## Expansion Path (Phase 2)

When the student pattern is proven, each new role gets its own folder:
```
tests/e2e/
  admin/
    routes.spec.ts
    brand.spec.ts
    visual.spec.ts
    interactions/
      default.spec.ts
      queue-pending.spec.ts
      ...
  agent/
  sponsor/
  university/
  partner/
```

`tests/unit/brand-compliance.test.ts` is already shared — no duplication needed for other roles.
