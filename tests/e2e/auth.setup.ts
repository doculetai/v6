/**
 * E2E auth setup — seeds DB, logs in as test student, saves storageState.
 * Runs before E2E tests via project dependency.
 *
 * Prereq: E2E_STUDENT_EMAIL, E2E_STUDENT_PASSWORD in .env.local
 * Or run: npm run db:seed:e2e (then E2E_SEED_ON_SETUP=false to skip seed in setup)
 */

import { test as setup, expect, type Page } from '@playwright/test';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { e2ePersonas, e2eConfig } from './fixtures/e2e-personas';

const authDir = join(process.cwd(), 'tests', 'e2e', '.auth');
const studentAuthFile = join(authDir, 'student.json');
const sponsorAuthFile = join(authDir, 'sponsor.json');
const universityAuthFile = join(authDir, 'university.json');
const adminAuthFile = join(authDir, 'admin.json');

async function authenticateAndSaveState(
  page: Page,
  credentials: { email: string; password: string },
  outputPath: string,
  optional = false,
) {
  // Retry up to 5x to handle Next.js Turbopack on-demand compilation (first request may return 404)
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.goto(`${e2eConfig.baseUrl}/login`);
    if (/\/dashboard/.test(page.url())) {
      await page.context().storageState({ path: outputPath });
      return true;
    }
    const ready = await page.locator('#login-email').isVisible({ timeout: 4_000 }).catch(() => false);
    if (ready) break;
    await page.waitForTimeout(1_500);
  }
  // Use specific IDs to avoid ambiguity with MagicLinkForm's email placeholder
  await expect(page.locator('#login-email')).toBeVisible();
  await page.locator('#login-email').fill(credentials.email);
  await page.locator('#login-password').fill(credentials.password);
  const submitBtn = page.locator('button[type="submit"]').first();
  // Wait for React hydration — login button starts disabled until useEffect sets isHydrated=true
  await expect(submitBtn).toBeEnabled({ timeout: 8_000 });
  await submitBtn.click();

  if (optional) {
    const landedOnDashboard = await page
      .waitForURL(/\/(dashboard|auth\/complete)/, { timeout: 45_000 })
      .then(() => true)
      .catch(() => false);
    if (!landedOnDashboard) {
      return false;
    }
  } else {
    await expect(page).toHaveURL(/\/(dashboard|auth\/complete)/, { timeout: 45_000 });
  }

  await page.context().storageState({ path: outputPath });
  return true;
}

setup('seed E2E data', async () => {
  setup.setTimeout(90_000);
  if (e2eConfig.seedOnSetup) {
    const { spawn } = await import('node:child_process');
    await new Promise<void>((resolve, reject) => {
      const child = spawn('npx', ['tsx', 'scripts/seed-e2e.ts'], {
        stdio: 'inherit',
        env: process.env,
        cwd: process.cwd(),
      });
      child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`seed exited ${code}`))));
      child.on('error', reject);
    });
  }
});

setup('authenticate as student', async ({ page }) => {
  if (!existsSync(authDir)) {
    mkdirSync(authDir, { recursive: true });
  }

  await authenticateAndSaveState(page, e2ePersonas.student, studentAuthFile);
});

setup('authenticate as sponsor', async ({ page }) => {
  if (existsSync(sponsorAuthFile)) {
    rmSync(sponsorAuthFile);
  }
  await authenticateAndSaveState(page, e2ePersonas.sponsor, sponsorAuthFile);
});

setup('authenticate as university', async ({ page }) => {
  if (existsSync(universityAuthFile)) {
    rmSync(universityAuthFile);
  }
  await authenticateAndSaveState(page, e2ePersonas.university, universityAuthFile);
});

setup('authenticate as admin', async ({ page }) => {
  if (existsSync(adminAuthFile)) {
    rmSync(adminAuthFile);
  }
  await authenticateAndSaveState(page, e2ePersonas.admin, adminAuthFile);
});
