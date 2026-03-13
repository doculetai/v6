/**
 * Layer D — University visual regression.
 * Pixel-diff baselines at 1440px. Update: npm run test:e2e:update-snapshots
 */

import { test, expect } from '@playwright/test';
import { setUniversityState } from '../helpers/db-university';

const SCHOOL_ID = process.env.E2E_UNIVERSITY_SCHOOL_ID!;

const DYNAMIC = (page: import('@playwright/test').Page) => ({
  mask: ['time', '[data-testid="timestamp"]', '[data-testid="relative-date"]',
    '[data-testid="notification-count"]'].map((s) => page.locator(s)),
});

async function prep(
  page: import('@playwright/test').Page,
  state: Parameters<typeof setUniversityState>[1],
  path: string,
) {
  await setUniversityState(SCHOOL_ID, state);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test('overview — default', async ({ page }) => {
  await prep(page, { hasPrograms: true }, '/dashboard/university');
  await expect(page).toHaveScreenshot('overview-default.png', DYNAMIC(page));
});

test('programs — empty', async ({ page }) => {
  await prep(page, { hasPrograms: false }, '/dashboard/university/programs');
  await expect(page).toHaveScreenshot('programs-empty.png', DYNAMIC(page));
});

test('programs — with programs', async ({ page }) => {
  await prep(page, { hasPrograms: true }, '/dashboard/university/programs');
  await expect(page).toHaveScreenshot('programs-with-data.png', DYNAMIC(page));
});

test('students page', async ({ page }) => {
  await prep(page, { hasPrograms: true }, '/dashboard/university/students');
  await expect(page).toHaveScreenshot('students-default.png', DYNAMIC(page));
});
