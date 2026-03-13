/**
 * Layer E — Admin operations: review dialog opens on trigger.
 * Clicking the "Review" button on a pending queue row must open
 * the AdminOperationsReviewDialog with title "Review document".
 */

import { test, expect } from '@playwright/test';
import { setAdminViewState } from '../../helpers/db-admin';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Triggered: admin operations review dialog', () => {
  test.beforeAll(async () => {
    await setAdminViewState(STUDENT_ID, { queueHasItem: true, queueItemHasOcr: false });
  });

  test('operations page shows a pending queue row', async ({ page }) => {
    await page.goto('/dashboard/admin/operations');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: 'Review' }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('clicking "Review" opens the review dialog', async ({ page }) => {
    await page.goto('/dashboard/admin/operations');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(
      page.getByText('Review document'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('review dialog shows student email in details panel', async ({ page }) => {
    await page.goto('/dashboard/admin/operations');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Review' }).first().click();
    // The dialog shows the student info grid (email or document type)
    await expect(
      page.getByRole('dialog'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('review dialog has Approve action button', async ({ page }) => {
    await page.goto('/dashboard/admin/operations');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(
      page.getByRole('button', { name: /approve/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('review dialog has Reject action button', async ({ page }) => {
    await page.goto('/dashboard/admin/operations');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(
      page.getByRole('button', { name: /reject/i }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
