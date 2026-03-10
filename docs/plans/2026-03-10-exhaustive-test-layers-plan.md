# Exhaustive 4-Layer Test Suite — Student Role Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build exhaustive test coverage for the student role across 4 layers: route coverage (A), interaction state matrix (B), brand/design compliance (C), and pixel-diff visual regression (D).

**Architecture:**
- Layers A + C-static: Vitest unit tests, pure static analysis, zero browser infrastructure
- Layers B + C-browser + D: Playwright E2E against a real local DB; a shared Drizzle helper (`tests/e2e/helpers/db.ts`) mutates the seeded student's state in `beforeAll` per spec
- New file structure: `tests/e2e/student/{routes,brand,visual}.spec.ts` + `tests/e2e/student/interactions/*.spec.ts`

**Tech Stack:** Playwright 1.x, Vitest, Drizzle ORM, `postgres-js`, TypeScript strict

**Note on `execSync` in tests:** `tests/unit/static-routes.test.ts` already uses `execSync` with hardcoded `find` arguments (no user input). The `brand-compliance.test.ts` in Task 4 follows the same established pattern. No injection risk.

**Prereq before any E2E task:** app running (`npm run dev`), env vars set, `npm run db:seed:e2e` run once.

---

## Task 1: Playwright config — visual project + snapshot settings + npm script

**Files:**
- Modify: `playwright.config.ts`
- Modify: `package.json`

**Step 1: Add visual project and snapshot config to `playwright.config.ts`**

Add inside `defineConfig({`, after the existing `use: {}` block:
```ts
expect: {
  toHaveScreenshot: { maxDiffPixels: 0 },
},
snapshotPathTemplate: 'tests/e2e/{testFilePath}/__screenshots__/{arg}{ext}',
```

Add inside the `projects: []` array:
```ts
{
  name: 'student-interactions',
  testMatch: /student\/interactions\/.+\.spec\.ts/,
  use: {
    ...devices['Desktop Chrome'],
    storageState: 'tests/e2e/.auth/student.json',
  },
  dependencies: ['setup'],
},
{
  name: 'visual',
  testMatch: /student\/visual\.spec\.ts/,
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    storageState: 'tests/e2e/.auth/student.json',
  },
  dependencies: ['setup'],
},
```

**Step 2: Add npm script to `package.json`**

```json
"test:e2e:update-snapshots": "playwright test --project=visual --update-snapshots"
```

**Step 3: Confirm config is valid**

```bash
npx playwright test --project=unauthenticated --list
```
Expected: lists auth + certificate specs, no errors.

**Step 4: Commit**

```bash
git add playwright.config.ts package.json
git commit -m "test(config): add visual + student-interactions playwright projects"
```

---

## Task 2: Layer A static — extend `tests/unit/static-routes.test.ts`

**Files:**
- Modify: `tests/unit/static-routes.test.ts`

**Context:** The existing test asserts every `href` in source code maps to a real `page.tsx`. This task adds a tighter dedicated describe for `studentNavConfig` — catches nav-to-route drift at import time, with a count assertion.

**Step 1: Add a new describe block at the bottom of the file**

```ts
import { studentNavConfig } from '@/config/nav/student';

describe('studentNavConfig route wiring', () => {
  const appFiles = listFiles("find src/app -name 'page.tsx'");
  const knownRoutes = appFiles.map(normalizeAppRoute);

  it('every student nav item href resolves to a real page.tsx', () => {
    const broken: string[] = [];
    for (const item of studentNavConfig.items) {
      if (!knownRoutes.some((route) => isRouteMatch(item.href, route))) {
        broken.push(item.href);
      }
    }
    expect(broken).toEqual([]);
  });

  it('student nav has exactly 6 items', () => {
    expect(studentNavConfig.items).toHaveLength(6);
  });

  it('every student nav item has a non-empty label and a /dashboard/student href', () => {
    for (const item of studentNavConfig.items) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.href.startsWith('/dashboard/student')).toBe(true);
    }
  });
});
```

**Step 2: Run**

```bash
npm run test -- tests/unit/static-routes.test.ts
```
Expected: all pass. If a test fails with a missing route, create the `page.tsx` or fix the nav href.

**Step 3: Commit**

```bash
git add tests/unit/static-routes.test.ts
git commit -m "test(layer-a): assert studentNavConfig hrefs against real page.tsx routes"
```

---

## Task 3: Layer A E2E — `tests/e2e/student/routes.spec.ts`

**Files:**
- Create: `tests/e2e/student/routes.spec.ts`

**Context:** Navigate to each of the 6 student nav items while authenticated. Assert no redirect, H1 matches nav label exactly (CLAUDE.md rule), `<main>` visible, no error boundary.

**Step 1: Create the spec**

```ts
/**
 * Layer A — Student route coverage.
 * Every student nav item: no login redirect, H1 matches label, main visible.
 */

import { test, expect } from '@playwright/test';
import { studentNavConfig } from '../../src/config/nav/student';

for (const item of studentNavConfig.items) {
  test(`route: ${item.label} (${item.href})`, async ({ page }) => {
    await page.goto(item.href);

    // No redirect to login
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(new RegExp(item.href.replace(/\//g, '\\/')), {
      timeout: 15_000,
    });

    // H1 matches nav label exactly — CLAUDE.md: "Page headings: H1 matches sidebar nav label exactly"
    await expect(
      page.getByRole('heading', { name: item.label, level: 1 }),
    ).toBeVisible({ timeout: 10_000 });

    // Main content area present
    await expect(page.getByRole('main')).toBeVisible();

    // No error boundary triggered
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });
}
```

**Step 2: Run**

```bash
npx playwright test tests/e2e/student/routes.spec.ts --project=chromium
```
Expected: 6 passing. If an H1 fails, the page heading doesn't follow CLAUDE.md — fix the page, not the test.

**Step 3: Commit**

```bash
git add tests/e2e/student/routes.spec.ts
git commit -m "test(layer-a): student route coverage — 6 nav items, H1 + main + no error"
```

---

## Task 4: Layer C static — `tests/unit/brand-compliance.test.ts`

**Files:**
- Create: `tests/unit/brand-compliance.test.ts`

**Context:** Scans `src/**` with `readFileSync` + regex. 5 rule groups from CLAUDE.md. Uses `execSync` with hardcoded `find` args — same pattern as existing `static-routes.test.ts`.

**Step 1: Create the file with helpers**

```ts
/**
 * Layer C — Brand/design compliance (static analysis).
 * Scans source files for forbidden design patterns per CLAUDE.md.
 * Uses execSync with hardcoded args — no user input, no injection risk.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

function listSrcFiles(): string[] {
  return execSync('find src -type f \\( -name "*.ts" -o -name "*.tsx" \\)', { encoding: 'utf8' })
    .trim().split('\n').filter(Boolean);
}

function listCopyFiles(): string[] {
  return execSync('find src/config/copy -type f -name "*.ts"', { encoding: 'utf8' })
    .trim().split('\n').filter(Boolean);
}

function concatFiles(files: string[]): string {
  return files.map((f) => readFileSync(f, 'utf8')).join('\n');
}
```

**Step 2: Add group 1 — forbidden raw Tailwind status colors**

```ts
// CLAUDE.md: "ALWAYS bg-success/text-success — NEVER bg-emerald-*, bg-amber-*, text-green-*"
describe('status color tokens', () => {
  it('no raw green/emerald classes in source', () => {
    const src = concatFiles(listSrcFiles());
    const forbidden = [/\btext-green-\d+\b/, /\bbg-green-\d+\b/, /\btext-emerald-\d+\b/, /\bbg-emerald-\d+\b/];
    expect(forbidden.filter((re) => re.test(src)).map(String)).toEqual([]);
  });

  it('no raw amber/yellow classes in source', () => {
    const src = concatFiles(listSrcFiles());
    const forbidden = [/\btext-amber-\d+\b/, /\bbg-amber-\d+\b/, /\btext-yellow-\d+\b/, /\bbg-yellow-\d+\b/];
    expect(forbidden.filter((re) => re.test(src)).map(String)).toEqual([]);
  });

  it('no raw red classes (use text-destructive/bg-destructive)', () => {
    const src = concatFiles(listSrcFiles());
    const forbidden = [/\btext-red-\d+\b/, /\bbg-red-\d+\b/];
    expect(forbidden.filter((re) => re.test(src)).map(String)).toEqual([]);
  });
});
```

**Step 3: Add group 2 — non-Phosphor icon imports**

```ts
// CLAUDE.md: "Phosphor Duotone only — no other icon libraries"
describe('icon library compliance', () => {
  it('no lucide-react imports', () => {
    expect(/from ['"]lucide-react['"]/.test(concatFiles(listSrcFiles()))).toBe(false);
  });

  it('no @heroicons imports', () => {
    expect(/from ['"]@heroicons/.test(concatFiles(listSrcFiles()))).toBe(false);
  });

  it('no react-icons imports', () => {
    expect(/from ['"]react-icons/.test(concatFiles(listSrcFiles()))).toBe(false);
  });
});
```

**Step 4: Add group 3 — emoji in copy configs**

```ts
// CLAUDE.md: "NO EMOJIS — never in UI, copy, code comments, or commit messages."
describe('no emoji in copy config', () => {
  it('no emoji characters in copy config files', () => {
    const src = concatFiles(listCopyFiles());
    const emojiRe = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1FA00}-\u{1FA9F}]/u;
    expect(emojiRe.test(src)).toBe(false);
  });
});
```

**Step 5: Add group 4 — section label word count**

```ts
// CLAUDE.md: "Copy length: section labels max 2 words"
describe('section label length', () => {
  it('no overline prop with more than 2 words', () => {
    const src = concatFiles(listSrcFiles());
    const matches = [...src.matchAll(/overline=["'`]([^"'`]+)["'`]/g)];
    const violations = matches
      .map((m) => m[1]?.trim() ?? '')
      .filter((label) => label.split(/\s+/).length > 2);
    expect(violations).toEqual([]);
  });
});
```

**Step 6: Add group 5 — hardcoded role accent hex in className**

```ts
// CLAUDE.md role accents must come from CSS vars, not hardcoded hex in className strings
describe('no hardcoded role accent hex in className', () => {
  it('role accent hex values are not in className strings', () => {
    const src = concatFiles(listSrcFiles());
    // The 6 role accent hex codes from CLAUDE.md
    const accentHexes = ['2B39A3', '15803D', '0369A1', 'C2410C', '6D28D9', '0F766E'];
    const violations = accentHexes.filter((hex) =>
      new RegExp(`className[^>]*#${hex}`, 'i').test(src),
    );
    expect(violations).toEqual([]);
  });
});
```

**Step 7: Run — fix any violations in source before committing**

```bash
npm run test -- tests/unit/brand-compliance.test.ts
```
If a raw color test fails: `grep -rn "text-green-" src/` to find the file, replace with the semantic token.
If icon import fails: `grep -rn "lucide-react" src/` to find it, replace with `@phosphor-icons/react`.

**Step 8: Commit**

```bash
git add tests/unit/brand-compliance.test.ts
git commit -m "test(layer-c): brand compliance static — 5 rule groups (colors, icons, emoji, labels, hex)"
```

---

## Task 5: Layer C browser — `tests/e2e/student/brand.spec.ts`

**Files:**
- Create: `tests/e2e/student/brand.spec.ts`

**Context:** Navigate to `/dashboard/student`, assert computed styles. Uses `chromium` project (student storageState already set up).

**Step 1: Create the spec**

```ts
/**
 * Layer C — Student brand compliance (browser computed styles).
 * Role accent, font families, CSS variable resolution.
 */

import { test, expect } from '@playwright/test';

test.describe('Student brand compliance (computed styles)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
  });

  test('active sidebar item has student role accent border-left', async ({ page }) => {
    // CLAUDE.md sidebar: active = borderLeft 3px solid var(--role-accent)
    const activeLink = page
      .locator('aside[aria-label*="navigation" i] a[aria-current="page"]')
      .first();
    await expect(activeLink).toBeVisible({ timeout: 10_000 });

    const borderColor = await activeLink.evaluate((el) => {
      const target = el.closest('[style*="borderLeft"]') ?? el;
      return getComputedStyle(target).borderLeftColor;
    });
    // Student accent #2B39A3 = rgb(43, 57, 163)
    expect(borderColor).toBe('rgb(43, 57, 163)');
  });

  test('body font-family is IBM Plex Sans', async ({ page }) => {
    const fontFamily = await page.evaluate(() =>
      getComputedStyle(document.body).fontFamily,
    );
    expect(fontFamily.toLowerCase()).toContain('ibm plex sans');
  });

  test('--role-accent CSS variable resolves to student accent', async ({ page }) => {
    const roleAccent = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--role-accent')
        .trim(),
    );
    expect(roleAccent).toBe('#2B39A3');
  });

  test('amount elements use IBM Plex Mono font', async ({ page }) => {
    const monoEl = page.locator('.font-mono, [data-testid="amount"]').first();
    if ((await monoEl.count()) === 0) return; // No amounts on this state — skip
    const fontFamily = await monoEl.evaluate((el) =>
      getComputedStyle(el).fontFamily,
    );
    expect(fontFamily.toLowerCase()).toContain('ibm plex mono');
  });
});
```

**Step 2: Run**

```bash
npx playwright test tests/e2e/student/brand.spec.ts --project=chromium
```
Expected: 4 passing. If the border-left test fails, read `src/components/layout/DashboardShell.tsx` — the active sidebar item must have `borderLeft: '3px solid var(--role-accent)'` inline style or equivalent CSS.

**Step 3: Commit**

```bash
git add tests/e2e/student/brand.spec.ts
git commit -m "test(layer-c): student brand — role accent border, IBM Plex fonts, CSS vars"
```

---

## Task 6: E2E DB state helper — `tests/e2e/helpers/db.ts`

**Files:**
- Create: `tests/e2e/helpers/db.ts`

**Context:** Each Layer B spec seeds a specific journey state before assertions. This helper connects to Drizzle with the same `DATABASE_URL` as the app and exports `setStudentState`. No mocks.

**Before writing:** Read `src/db/queries/student-verification.ts` to confirm which column drives `hasPhone` (T1). It may be `users.phone IS NOT NULL` (update `users` table) or a `kycVerifications` tier-1 record. Adjust the T1 seeding block below accordingly.

**Step 1: Create the helper**

```ts
/**
 * E2E DB state helper — direct Drizzle mutations for Layer B interaction specs.
 * Prereq: DATABASE_URL in .env.local, E2E_STUDENT_USER_ID set.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../../src/db/schema';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const { studentProfiles, kycVerifications, bankAccounts, documents, certificates } = schema;

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  return drizzle(client, { schema });
}

export interface StudentJourneyState {
  t1PhoneVerified: boolean;
  t2KycVerified: boolean;
  t3BankVerified: boolean;
  onboardingComplete: boolean;
  documentStatus: 'none' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  certificateIssued: boolean;
  ocrReviewPending?: boolean;
}

export async function setStudentState(
  userId: string,
  state: StudentJourneyState,
): Promise<void> {
  const db = createDb();

  // Clear all variable state
  await db.delete(certificates).where(eq(certificates.studentId, userId));
  await db.delete(documents).where(eq(documents.userId, userId));
  await db.delete(bankAccounts).where(eq(bankAccounts.userId, userId));
  await db.delete(kycVerifications).where(eq(kycVerifications.userId, userId));

  // Onboarding: schoolId null = not complete
  await db.update(studentProfiles).set({
    schoolId: state.onboardingComplete ? undefined : null,
    programId: state.onboardingComplete ? undefined : null,
    kycStatus: 'not_started',
    bankStatus: 'not_started',
  }).where(eq(studentProfiles.userId, userId));

  // T1: phone — check src/db/queries/student-verification.ts for hasPhone source.
  // If hasPhone = users.phone IS NOT NULL, use:
  //   await db.update(users).set({ phone: state.t1PhoneVerified ? '+2348012345678' : null })
  //     .where(eq(users.id, userId));
  // If hasPhone = kycVerification tier 1, use the insert below:
  if (state.t1PhoneVerified) {
    await db.insert(kycVerifications).values({
      userId, tier: 1, status: 'verified', provider: 'dojah',
      referenceId: `e2e_t1_${Date.now()}`, verifiedAt: new Date(),
    });
  }

  // T2: KYC identity
  if (state.t2KycVerified) {
    await db.insert(kycVerifications).values({
      userId, tier: 2, status: 'verified', provider: 'dojah',
      referenceId: `e2e_t2_${Date.now()}`, verifiedAt: new Date(),
    });
    await db.update(studentProfiles).set({ kycStatus: 'verified' })
      .where(eq(studentProfiles.userId, userId));
  }

  // T3: bank account
  if (state.t3BankVerified) {
    await db.insert(bankAccounts).values({
      userId, provider: 'mono', accountNumber: '0123456789',
      bankName: 'Zenith Bank', monoAccountId: `e2e_mono_${Date.now()}`,
      accountCurrency: 'NGN', accountType: 'savings', bankCountry: 'NG',
      accountOwnership: 'self', linkedAt: new Date(),
    });
    await db.update(studentProfiles).set({ bankStatus: 'verified' })
      .where(eq(studentProfiles.userId, userId));
  }

  // Document
  if (state.documentStatus !== 'none') {
    await db.insert(documents).values({
      userId, type: 'bank_statement',
      storageUrl: 'https://placeholder.doculet.ai/e2e/statement.pdf',
      status: state.documentStatus,
      rejectionReason: state.documentStatus === 'rejected'
        ? (state.rejectionReason ?? 'Balance below required minimum. Resubmit with correct statement.')
        : null,
      reviewedAt: state.documentStatus !== 'pending' ? new Date() : null,
    });
  }

  // Certificate
  if (state.certificateIssued) {
    await db.insert(certificates).values({
      studentId: userId, token: `e2e_cert_${Date.now()}`,
      status: 'active', paymentStatus: 'paid', issuedAt: new Date(),
      metaJson: {
        studentName: 'E2E Student', schoolName: 'Test University',
        programName: 'Computer Science', amount: 1500000, currency: 'NGN',
      },
    });
  }
}
```

**Step 2: Find the seeded student's user ID and add to `.env.local`**

```bash
# Option 1: via Drizzle Studio
npm run db:studio
# Browse to the users table, find the E2E student email row, copy the id

# Option 2: via psql
psql $DATABASE_URL -c "SELECT id FROM users WHERE email = '$E2E_STUDENT_EMAIL';"
```

Add to `.env.local`:
```
E2E_STUDENT_USER_ID=<uuid>
```

**Step 3: Verify the helper compiles**

```bash
npx tsx -e "import('./tests/e2e/helpers/db.ts').then(m => console.log('DB helper OK:', Object.keys(m)))"
```
Expected: `DB helper OK: [ 'setStudentState' ]`

**Step 4: Commit**

```bash
git add tests/e2e/helpers/db.ts
git commit -m "test(layer-b): E2E DB state helper — setStudentState for interaction specs"
```

---

## Task 7: Layer B — `interactions/first-session.spec.ts`

**Files:**
- Create: `tests/e2e/student/interactions/first-session.spec.ts`

**State:** All journey inputs false.

```ts
import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: first session', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: false, t2KycVerified: false, t3BankVerified: false,
      onboardingComplete: false, documentStatus: 'none', certificateIssued: false,
    });
  });

  test('shows "Begin your application" card', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/begin your application/i)).toBeVisible({ timeout: 10_000 });
  });

  test('all 4 journey stages show upcoming (none completed)', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-stage-status="completed"]')).toHaveCount(0, { timeout: 10_000 });
  });

  test('nextAction CTA links to /dashboard/student/setup', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    const cta = page.getByRole('link', { name: /set up your profile/i }).first();
    await expect(cta).toBeVisible({ timeout: 10_000 });
    await cta.click();
    await expect(page).toHaveURL(/\/dashboard\/student\/setup/, { timeout: 10_000 });
  });
});
```

```bash
npx playwright test tests/e2e/student/interactions/first-session.spec.ts --project=student-interactions
git add tests/e2e/student/interactions/first-session.spec.ts
git commit -m "test(layer-b): first session — all upcoming, begin application card"
```

---

## Task 8: Layer B — `interactions/onboarding-complete.spec.ts`

**State:** School + program selected, no verification.

```ts
import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: onboarding complete', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: false, t2KycVerified: false, t3BankVerified: false,
      onboardingComplete: true, documentStatus: 'none', certificateIssued: false,
    });
  });

  test('stage 1 completed, stage 2 current', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-stage-id="onboarding"]'))
      .toHaveAttribute('data-stage-status', 'completed', { timeout: 10_000 });
    await expect(page.locator('[data-stage-id="verification"]'))
      .toHaveAttribute('data-stage-status', 'current');
  });

  test('nextAction CTA is "Continue verification"', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('link', { name: /continue verification/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
```

```bash
npx playwright test tests/e2e/student/interactions/onboarding-complete.spec.ts --project=student-interactions
git add tests/e2e/student/interactions/onboarding-complete.spec.ts
git commit -m "test(layer-b): onboarding complete — stage 2 current, verification CTA"
```

---

## Task 9: Layer B — `interactions/t1-complete.spec.ts`

**State:** Phone verified. T2 not started.

```ts
import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: T1 complete', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: false, t3BankVerified: false,
      onboardingComplete: true, documentStatus: 'none', certificateIssued: false,
    });
  });

  test('T1 ticked, T2 expanded, T3 dimmed — no lock icon', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-tier="1"]'))
      .toHaveAttribute('data-status', 'verified', { timeout: 10_000 });
    // T3 visible but no lock icon (CLAUDE.md: "no lock icon")
    await expect(page.locator('[data-tier="3"]')).toBeVisible();
    await expect(
      page.locator('[data-tier="3"] [data-testid="lock-icon"]'),
    ).toHaveCount(0);
  });
});
```

```bash
npx playwright test tests/e2e/student/interactions/t1-complete.spec.ts --project=student-interactions
git add tests/e2e/student/interactions/t1-complete.spec.ts
git commit -m "test(layer-b): T1 complete — T2 expanded, T3 dimmed, no lock icon"
```

---

## Task 10: Layer B — `interactions/t2-complete.spec.ts`

**State:** T1 + T2 verified. T3 choice cards visible.

```ts
import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: T2 complete', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: false,
      onboardingComplete: true, documentStatus: 'none', certificateIssued: false,
    });
  });

  test('T1+T2 ticked, T3 shows both choice cards (no dropdown)', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-tier="2"]'))
      .toHaveAttribute('data-status', 'verified', { timeout: 10_000 });
    // Both options first-class (CLAUDE.md: "side-by-side choice cards, both first-class")
    await expect(page.getByText(/connect bank/i)).toBeVisible();
    await expect(page.getByText(/upload.*statement/i)).toBeVisible();
    // Not a dropdown
    await expect(page.locator('[data-tier="3"] select')).toHaveCount(0);
  });
});
```

```bash
npx playwright test tests/e2e/student/interactions/t2-complete.spec.ts --project=student-interactions
git add tests/e2e/student/interactions/t2-complete.spec.ts
git commit -m "test(layer-b): T2 complete — T3 side-by-side choice cards, no dropdown"
```

---

## Task 11: Layer B — `interactions/verification-complete.spec.ts`

**State:** All 3 tiers verified. Documents not yet uploaded.

```ts
import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: verification complete', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: true,
      onboardingComplete: true, documentStatus: 'none', certificateIssued: false,
    });
  });

  test('stage 2 completed, stage 3 current, CTA = "Upload statement"', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-stage-id="verification"]'))
      .toHaveAttribute('data-stage-status', 'completed', { timeout: 10_000 });
    await expect(page.locator('[data-stage-id="documents"]'))
      .toHaveAttribute('data-stage-status', 'current');
    await expect(
      page.getByRole('link', { name: /upload statement/i }).first(),
    ).toBeVisible();
  });
});
```

```bash
npx playwright test tests/e2e/student/interactions/verification-complete.spec.ts --project=student-interactions
git add tests/e2e/student/interactions/verification-complete.spec.ts
git commit -m "test(layer-b): verification complete — stage 3 current, upload CTA"
```

---

## Task 12: Layer B — `interactions/ocr-review.spec.ts`

**State:** Bank statement pending, OCR review card visible.

```ts
import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: OCR review', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: false,
      onboardingComplete: true, documentStatus: 'pending', ocrReviewPending: true,
      certificateIssued: false,
    });
  });

  test('OCR review card with 4 editable fields + confirm CTA', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await page.waitForLoadState('networkidle');
    // OCR card visible inline (CLAUDE.md: "OCR review card inline below uploaded file")
    await expect(page.locator('[data-ocr-review-field]')).toHaveCount(4, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: /confirm and submit/i })).toBeVisible();
  });
});
```

```bash
npx playwright test tests/e2e/student/interactions/ocr-review.spec.ts --project=student-interactions
git add tests/e2e/student/interactions/ocr-review.spec.ts
git commit -m "test(layer-b): OCR review — 4 editable fields, confirm CTA"
```

---

## Task 13: Layer B — `interactions/document-rejected.spec.ts`

**State:** Bank statement rejected with admin note.

```ts
import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;
const NOTE = 'Balance below required minimum. Resubmit with correct statement.';

test.describe.serial('Journey state: document rejected', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: false,
      onboardingComplete: true, documentStatus: 'rejected', rejectionReason: NOTE,
      certificateIssued: false,
    });
  });

  test('rejection note shown verbatim, Resubmit CTA present', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await page.waitForLoadState('networkidle');
    // CLAUDE.md: "Reject (written note shown verbatim to student)"
    await expect(page.getByText(NOTE)).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole('button', { name: /resubmit/i }).or(page.getByRole('link', { name: /resubmit/i })),
    ).toBeVisible();
  });

  test('no apologetic language in rejection state', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await page.waitForLoadState('networkidle');
    const content = await page.getByRole('main').textContent() ?? '';
    expect(content.toLowerCase()).not.toMatch(/oops|sorry about that|something went wrong/);
  });

  test('no "cancel submission" on rejected doc (only on pending)', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /cancel submission/i })).not.toBeVisible();
  });
});
```

```bash
npx playwright test tests/e2e/student/interactions/document-rejected.spec.ts --project=student-interactions
git add tests/e2e/student/interactions/document-rejected.spec.ts
git commit -m "test(layer-b): document rejected — verbatim note, no apologetic language"
```

---

## Task 14: Layer B — `interactions/documents-complete.spec.ts`

**State:** All tiers + document approved.

```ts
import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: documents complete', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: true,
      onboardingComplete: true, documentStatus: 'approved', certificateIssued: false,
    });
  });

  test('all 3 stages completed, proof stage current', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    for (const stage of ['onboarding', 'verification', 'documents']) {
      await expect(page.locator(`[data-stage-id="${stage}"]`))
        .toHaveAttribute('data-stage-status', 'completed', { timeout: 10_000 });
    }
    await expect(page.locator('[data-stage-id="proof"]'))
      .toHaveAttribute('data-stage-status', 'current');
  });
});
```

```bash
npx playwright test tests/e2e/student/interactions/documents-complete.spec.ts --project=student-interactions
git add tests/e2e/student/interactions/documents-complete.spec.ts
git commit -m "test(layer-b): documents complete — proof stage current"
```

---

## Task 15: Layer B — `interactions/under-final-review.spec.ts`

**State:** All complete, no cert yet. Proof page in "Under final review" state.

```ts
import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: under final review', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: true,
      onboardingComplete: true, documentStatus: 'approved', certificateIssued: false,
    });
  });

  test('"Under final review" message visible, no action CTA', async ({ page }) => {
    await page.goto('/dashboard/student/proof');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/under final review/i)).toBeVisible({ timeout: 10_000 });
    // CLAUDE.md: "No action, no countdown"
    await expect(page.getByRole('button', { name: /download/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /share/i })).not.toBeVisible();
  });

  test('no SLA copy (no countdown, no X days)', async ({ page }) => {
    await page.goto('/dashboard/student/proof');
    await page.waitForLoadState('networkidle');
    const content = await page.getByRole('main').textContent() ?? '';
    // CLAUDE.md: "never use: within 24 hours, within 2 business days, shortly, soon"
    expect(content).not.toMatch(/within \d+|business day|shortly|soon|\d+ hour/i);
  });
});
```

```bash
npx playwright test tests/e2e/student/interactions/under-final-review.spec.ts --project=student-interactions
git add tests/e2e/student/interactions/under-final-review.spec.ts
git commit -m "test(layer-b): under final review — no CTA, no SLA copy"
```

---

## Task 16: Layer B — `interactions/proof-ready.spec.ts`

**State:** Certificate issued.

```ts
import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: proof ready', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: true,
      onboardingComplete: true, documentStatus: 'approved', certificateIssued: true,
    });
  });

  test('proof page H1 is "Proof of Funds Certificate"', async ({ page }) => {
    await page.goto('/dashboard/student/proof');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: /proof of funds certificate/i, level: 1 }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('"Download PDF" and "Share" CTAs both visible', async ({ page }) => {
    await page.goto('/dashboard/student/proof');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: /download pdf/i }).or(page.getByRole('link', { name: /download pdf/i })),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /share/i })).toBeVisible();
  });

  test('History tab present', async ({ page }) => {
    await page.goto('/dashboard/student/proof');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('tab', { name: /history/i })).toBeVisible({ timeout: 10_000 });
  });

  test('overview H1 is "Your proof of funds is verified."', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    // CLAUDE.md: "Post-cert Overview: H1 'Your proof of funds is verified.'"
    await expect(
      page.getByRole('heading', { name: /your proof of funds is verified/i }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
```

```bash
npx playwright test tests/e2e/student/interactions/proof-ready.spec.ts --project=student-interactions
git add tests/e2e/student/interactions/proof-ready.spec.ts
git commit -m "test(layer-b): proof ready — cert issued, dual CTAs, post-cert overview H1"
```

---

## Task 17: Layer D — `tests/e2e/student/visual.spec.ts` + baseline capture

**Files:**
- Create: `tests/e2e/student/visual.spec.ts`
- Generated: `tests/e2e/student/__screenshots__/*.png` (committed after Step 2)

**Step 1: Create the spec**

```ts
/**
 * Layer D — Student visual regression.
 * Pixel-diff baselines. maxDiffPixels: 0 (set in playwright.config.ts).
 * To update: npm run test:e2e:update-snapshots
 */

import { test, expect } from '@playwright/test';
import { setStudentState } from '../helpers/db';
import type { StudentJourneyState } from '../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

const DYNAMIC = (page: import('@playwright/test').Page) => ({
  mask: ['time', '[data-testid="timestamp"]', '[data-testid="relative-date"]',
    '[data-testid="notification-count"]'].map((s) => page.locator(s)),
});

async function prep(page: import('@playwright/test').Page, state: StudentJourneyState, path: string) {
  await setStudentState(STUDENT_ID, state);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // font settle
}

const S = {
  fresh: { t1PhoneVerified: false, t2KycVerified: false, t3BankVerified: false,
    onboardingComplete: false, documentStatus: 'none', certificateIssued: false } satisfies StudentJourneyState,
  onboardingDone: { t1PhoneVerified: false, t2KycVerified: false, t3BankVerified: false,
    onboardingComplete: true, documentStatus: 'none', certificateIssued: false } satisfies StudentJourneyState,
  allComplete: { t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: true,
    onboardingComplete: true, documentStatus: 'approved', certificateIssued: true } satisfies StudentJourneyState,
  t2Done: { t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: false,
    onboardingComplete: true, documentStatus: 'none', certificateIssued: false } satisfies StudentJourneyState,
};

test('overview — first session', async ({ page }) => {
  await prep(page, S.fresh, '/dashboard/student');
  await expect(page).toHaveScreenshot('overview-first-session.png', DYNAMIC(page));
});

test('overview — onboarding complete', async ({ page }) => {
  await prep(page, S.onboardingDone, '/dashboard/student');
  await expect(page).toHaveScreenshot('overview-onboarding-complete.png', DYNAMIC(page));
});

test('overview — proof ready', async ({ page }) => {
  await prep(page, S.allComplete, '/dashboard/student');
  await expect(page).toHaveScreenshot('overview-proof-ready.png', DYNAMIC(page));
});

test('verification — T2 complete', async ({ page }) => {
  await prep(page, S.t2Done, '/dashboard/student/verification');
  await expect(page).toHaveScreenshot('verification-t2-complete.png', DYNAMIC(page));
});

test('documents — OCR review', async ({ page }) => {
  await prep(page, {
    t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: false,
    onboardingComplete: true, documentStatus: 'pending', ocrReviewPending: true, certificateIssued: false,
  }, '/dashboard/student/documents');
  await expect(page).toHaveScreenshot('documents-ocr-review.png', DYNAMIC(page));
});

test('documents — rejected', async ({ page }) => {
  await prep(page, {
    t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: false,
    onboardingComplete: true, documentStatus: 'rejected',
    rejectionReason: 'Balance below required minimum. Resubmit with correct statement.',
    certificateIssued: false,
  }, '/dashboard/student/documents');
  await expect(page).toHaveScreenshot('documents-rejected.png', DYNAMIC(page));
});

test('proof — under final review', async ({ page }) => {
  await prep(page, {
    t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: true,
    onboardingComplete: true, documentStatus: 'approved', certificateIssued: false,
  }, '/dashboard/student/proof');
  await expect(page).toHaveScreenshot('proof-under-final-review.png', DYNAMIC(page));
});

test('proof — cert ready', async ({ page }) => {
  await prep(page, S.allComplete, '/dashboard/student/proof');
  await expect(page).toHaveScreenshot('proof-cert-ready.png', DYNAMIC(page));
});
```

**Step 2: Capture baselines (one-time)**

```bash
npm run test:e2e:update-snapshots
```
Expected: 8 PNGs created in `tests/e2e/student/__screenshots__/`. All future runs compare against these.

**Step 3: Verify all pass after capture**

```bash
npx playwright test tests/e2e/student/visual.spec.ts --project=visual
```
Expected: 8 passing.

**Step 4: Commit spec + baselines**

```bash
git add tests/e2e/student/visual.spec.ts tests/e2e/student/__screenshots__/
git commit -m "test(layer-d): student visual regression — 8 pixel-diff baselines committed"
```

---

## Final verification — all 4 layers

```bash
# Layers A + C static
npm run test -- tests/unit/static-routes.test.ts tests/unit/brand-compliance.test.ts

# Layer A E2E
npx playwright test tests/e2e/student/routes.spec.ts --project=chromium

# Layer C browser
npx playwright test tests/e2e/student/brand.spec.ts --project=chromium

# Layer B all states
npx playwright test tests/e2e/student/interactions/ --project=student-interactions

# Layer D visual
npx playwright test tests/e2e/student/visual.spec.ts --project=visual
```

---

## Updating baselines after an intentional design change

```bash
npm run test:e2e:update-snapshots
git add tests/e2e/student/__screenshots__/
git commit -m "test(visual): update baselines — <describe the change>"
```

Never update baselines as part of a feature PR without a separate commit explaining what changed visually.

---

## Expansion path (Phase 2)

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

`tests/unit/brand-compliance.test.ts` is already shared — no duplication needed.
