/**
 * E2E: University pipeline review.
 *
 * Validates current university queue UX at /dashboard/university/pipeline.
 */

import { test, expect } from '@playwright/test';

test.describe('University pipeline', () => {
  test.use({ storageState: 'tests/e2e/.auth/university.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/university/pipeline');
    await expect(page).toHaveURL(/\/dashboard\/university\/pipeline/);
  });

  test('shows pipeline page shell', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /application pipeline/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('shows pipeline table with applicant column or empty state', async ({ page }) => {
    // The pipeline renders a DataTable (not a kanban board) with an Applicant column
    const hasApplicantCol = await page
      .getByRole('columnheader', { name: /applicant/i })
      .isVisible({ timeout: 8_000 })
      .catch(() => false);

    const hasEmptyState = await page
      .getByText(/no applications yet/i)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    const hasStatusCol = await page
      .getByRole('columnheader', { name: /status/i })
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    expect(hasApplicantCol || hasStatusCol || hasEmptyState).toBe(true);
  });

  test('shows queue table or empty state', async ({ page }) => {
    const hasDesktopTable = await page
      .getByRole('columnheader', { name: /applicant/i })
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    const hasMobileList = await page
      .locator('ul[role="list"] li')
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    const hasEmpty = await page
      .getByText(/no applications yet/i)
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    expect(hasDesktopTable || hasMobileList || hasEmpty).toBe(true);
  });
});
