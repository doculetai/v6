/**
 * Layer D — Partner visual regression.
 * Pixel-diff baselines at 1440px. Update: npm run test:e2e:update-snapshots
 */

import { test, expect } from '@playwright/test';
import { setPartnerState } from '../helpers/db-partner';

const PARTNER_PROFILE_ID = process.env.E2E_PARTNER_PROFILE_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

const DYNAMIC = (page: import('@playwright/test').Page) => ({
  mask: ['time', '[data-testid="timestamp"]', '[data-testid="relative-date"]',
    '[data-testid="notification-count"]'].map((s) => page.locator(s)),
});

async function prep(
  page: import('@playwright/test').Page,
  state: Parameters<typeof setPartnerState>[2],
  path: string,
) {
  await setPartnerState(PARTNER_PROFILE_ID, STUDENT_ID, state);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test('overview — no keys', async ({ page }) => {
  await prep(page, { hasApiKeys: false, hasStudents: false }, '/dashboard/partner');
  await expect(page).toHaveScreenshot('overview-no-keys.png', DYNAMIC(page));
});

test('overview — with keys and students', async ({ page }) => {
  await prep(page, { hasApiKeys: true, hasStudents: true }, '/dashboard/partner');
  await expect(page).toHaveScreenshot('overview-with-keys.png', DYNAMIC(page));
});

test('api-keys — empty', async ({ page }) => {
  await prep(page, { hasApiKeys: false, hasStudents: false }, '/dashboard/partner/api-keys');
  await expect(page).toHaveScreenshot('api-keys-empty.png', DYNAMIC(page));
});

test('api-keys — with key', async ({ page }) => {
  await prep(page, { hasApiKeys: true, hasStudents: false }, '/dashboard/partner/api-keys');
  await expect(page).toHaveScreenshot('api-keys-with-key.png', DYNAMIC(page));
});

test('students — with verified student', async ({ page }) => {
  await prep(page, { hasApiKeys: true, hasStudents: true }, '/dashboard/partner/students');
  await expect(page).toHaveScreenshot('students-with-data.png', DYNAMIC(page));
});
