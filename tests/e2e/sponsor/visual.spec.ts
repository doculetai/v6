/**
 * Layer D — Sponsor visual regression.
 * Pixel-diff baselines at 1440px. Update: npm run test:e2e:update-snapshots
 */

import { test, expect } from '@playwright/test';
import { setSponsorState } from '../helpers/db-sponsor';

const SPONSOR_ID = process.env.E2E_SPONSOR_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

const DYNAMIC = (page: import('@playwright/test').Page) => ({
  mask: ['time', '[data-testid="timestamp"]', '[data-testid="relative-date"]',
    '[data-testid="notification-count"]'].map((s) => page.locator(s)),
});

async function prep(
  page: import('@playwright/test').Page,
  state: Parameters<typeof setSponsorState>[2],
  path: string,
) {
  await setSponsorState(SPONSOR_ID, STUDENT_ID, state);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test('overview — no commitments', async ({ page }) => {
  await prep(page, { hasCommitment: false }, '/dashboard/sponsor');
  await expect(page).toHaveScreenshot('overview-no-commitments.png', DYNAMIC(page));
});

test('overview — with active commitment', async ({ page }) => {
  await prep(page, { hasCommitment: true, commitmentStatus: 'active' }, '/dashboard/sponsor');
  await expect(page).toHaveScreenshot('overview-with-commitment.png', DYNAMIC(page));
});

test('commitments — with active commitment', async ({ page }) => {
  await prep(page, { hasCommitment: true, commitmentStatus: 'active' }, '/dashboard/sponsor/commitments');
  await expect(page).toHaveScreenshot('commitments-active.png', DYNAMIC(page));
});

test('commitments — empty', async ({ page }) => {
  await prep(page, { hasCommitment: false }, '/dashboard/sponsor/commitments');
  await expect(page).toHaveScreenshot('commitments-empty.png', DYNAMIC(page));
});

test('overview — pending commitment', async ({ page }) => {
  await prep(page, { hasCommitment: true, commitmentStatus: 'pending' }, '/dashboard/sponsor');
  await expect(page).toHaveScreenshot('overview-pending-commitment.png', DYNAMIC(page));
});

test('overview — student certified', async ({ page }) => {
  await prep(page, { hasCommitment: true, commitmentStatus: 'active', studentCertIssued: true }, '/dashboard/sponsor');
  await expect(page).toHaveScreenshot('overview-student-certified.png', DYNAMIC(page));
});
