/**
 * Layer D — Agent visual regression.
 * Pixel-diff baselines at 1440px. Update: npm run test:e2e:update-snapshots
 */

import { test, expect } from '@playwright/test';
import { setAgentState } from '../helpers/db-agent';

const AGENT_ID = process.env.E2E_AGENT_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

const DYNAMIC = (page: import('@playwright/test').Page) => ({
  mask: ['time', '[data-testid="timestamp"]', '[data-testid="relative-date"]',
    '[data-testid="notification-count"]'].map((s) => page.locator(s)),
});

async function prep(
  page: import('@playwright/test').Page,
  state: Parameters<typeof setAgentState>[2],
  path: string,
) {
  await setAgentState(AGENT_ID, STUDENT_ID, state);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test('overview — no students', async ({ page }) => {
  await prep(page, { hasAssignedStudent: false, hasPendingCommission: false }, '/dashboard/agent');
  await expect(page).toHaveScreenshot('overview-no-students.png', DYNAMIC(page));
});

test('overview — with students', async ({ page }) => {
  await prep(page, { hasAssignedStudent: true, hasPendingCommission: false }, '/dashboard/agent');
  await expect(page).toHaveScreenshot('overview-with-students.png', DYNAMIC(page));
});

test('students — with assigned student', async ({ page }) => {
  await prep(page, { hasAssignedStudent: true, hasPendingCommission: false }, '/dashboard/agent/students');
  await expect(page).toHaveScreenshot('students-with-assignment.png', DYNAMIC(page));
});

test('commissions — with pending commission', async ({ page }) => {
  await prep(page, { hasAssignedStudent: true, hasPendingCommission: true }, '/dashboard/agent/commissions');
  await expect(page).toHaveScreenshot('commissions-pending.png', DYNAMIC(page));
});

test('overview — needs attention (student blocked)', async ({ page }) => {
  await prep(page, { hasAssignedStudent: true, hasPendingCommission: false, studentHasRejectedDoc: true }, '/dashboard/agent');
  await expect(page).toHaveScreenshot('overview-needs-attention.png', DYNAMIC(page));
});

test('overview — all certified (mature portfolio)', async ({ page }) => {
  await prep(page, { hasAssignedStudent: true, hasPendingCommission: false, studentCertIssued: true }, '/dashboard/agent');
  await expect(page).toHaveScreenshot('overview-all-certified.png', DYNAMIC(page));
});
