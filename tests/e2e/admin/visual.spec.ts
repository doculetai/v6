/**
 * Layer D — Admin visual regression.
 * Pixel-diff baselines at 1440px. Update: npm run test:e2e:update-snapshots
 */

import { test, expect } from '@playwright/test';
import { setAdminViewState } from '../helpers/db-admin';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

const DYNAMIC = (page: import('@playwright/test').Page) => ({
  mask: ['time', '[data-testid="timestamp"]', '[data-testid="relative-date"]',
    '[data-testid="notification-count"]'].map((s) => page.locator(s)),
});

async function prep(
  page: import('@playwright/test').Page,
  setupFn: () => Promise<void>,
  path: string,
) {
  await setupFn();
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test('overview — default', async ({ page }) => {
  await prep(page, () => setAdminViewState(STUDENT_ID, { queueHasItem: false }), '/dashboard/admin');
  await expect(page).toHaveScreenshot('overview-default.png', DYNAMIC(page));
});

test('operations — queue empty', async ({ page }) => {
  await prep(page, () => setAdminViewState(STUDENT_ID, { queueHasItem: false }), '/dashboard/admin/operations');
  await expect(page).toHaveScreenshot('operations-queue-empty.png', DYNAMIC(page));
});

test('operations — queue with items', async ({ page }) => {
  await prep(page, () => setAdminViewState(STUDENT_ID, { queueHasItem: true, queueItemHasOcr: true }), '/dashboard/admin/operations');
  await expect(page).toHaveScreenshot('operations-queue-with-items.png', DYNAMIC(page));
});

test('analytics page', async ({ page }) => {
  await prep(page, () => setAdminViewState(STUDENT_ID, { queueHasItem: false }), '/dashboard/admin/analytics');
  await expect(page).toHaveScreenshot('analytics-default.png', DYNAMIC(page));
});

test('risk page', async ({ page }) => {
  await prep(page, () => setAdminViewState(STUDENT_ID, { queueHasItem: false }), '/dashboard/admin/risk');
  await expect(page).toHaveScreenshot('risk-default.png', DYNAMIC(page));
});
