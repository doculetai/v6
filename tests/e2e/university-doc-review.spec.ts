/**
 * E2E: University pipeline review.
 *
 * Validates current university queue UX at /dashboard/university/pipeline.
 */

import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/login';

test.describe('University pipeline', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'university');
    await page.goto('/dashboard/university/pipeline');
    await expect(page).toHaveURL(/\/dashboard\/university\/pipeline/);
  });

  test('shows pipeline page shell', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /application pipeline/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('shows kanban columns', async ({ page }) => {
    await expect(page.getByText('Applied').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Verified').first()).toBeVisible({ timeout: 10_000 });
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
