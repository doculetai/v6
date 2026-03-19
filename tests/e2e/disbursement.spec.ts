/**
 * E2E: Sponsor transactions and admin platform operations.
 *
 * Tests:
 * 1. Sponsor transactions page loads and shows heading
 * 2. Admin transactions page loads
 * 3. Admin platform fees page loads and shows fee rules
 *
 * Requires sponsor auth: E2E_SPONSOR_EMAIL, E2E_SPONSOR_PASSWORD
 * Requires admin auth: E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD
 * See tests/e2e/README.md for auth setup.
 */

import { test, expect } from '@playwright/test';

test.describe('Sponsor transactions', () => {
  test.use({ storageState: 'tests/e2e/.auth/sponsor.json' });

  test('transactions page loads', async ({ page }) => {
    await page.goto('/dashboard/sponsor/transactions');
    await expect(page).toHaveURL(/\/dashboard\/sponsor\/transactions/);
    await expect(page.getByRole('heading', { name: /transactions/i }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('shows transactions section or empty state', async ({ page }) => {
    await page.goto('/dashboard/sponsor/transactions');
    await expect(page).toHaveURL(/\/dashboard\/sponsor\/transactions/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
  });

  test('shows transactions list or no-transactions state', async ({ page }) => {
    await page.goto('/dashboard/sponsor/transactions');
    await expect(page).toHaveURL(/\/dashboard\/sponsor\/transactions/);

    await expect
      .poll(
        async () => {
          const rowCount = await page.locator('table tbody tr').count();
          const emptyCount = await page.getByText(/no transactions yet/i).count();
          return rowCount > 0 || emptyCount > 0;
        },
        { timeout: 15_000 },
      )
      .toBe(true);
  });
});

test.describe('Admin transactions', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin.json' });

  test('transactions page loads for admin', async ({ page }) => {
    await page.goto('/dashboard/admin/transactions');
    await expect(page).toHaveURL(/\/dashboard\/admin\/transactions/);
    await expect(page.getByRole('heading', { name: /transactions/i }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('shows transactions or empty state', async ({ page }) => {
    await page.goto('/dashboard/admin/transactions');
    await expect(page).toHaveURL(/\/dashboard\/admin\/transactions/);

    await expect
      .poll(
        async () => {
          const rowCount = await page.locator('table tbody tr').count();
          const emptyCount = await page.getByText(/no transactions yet/i).count();
          return rowCount > 0 || emptyCount > 0;
        },
        { timeout: 15_000 },
      )
      .toBe(true);
  });

  test('page renders main content area', async ({ page }) => {
    await page.goto('/dashboard/admin/transactions');
    await expect(page).toHaveURL(/\/dashboard\/admin\/transactions/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Admin platform fees', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin.json' });

  test('platform fees page loads for admin', async ({ page }) => {
    await page.goto('/dashboard/admin/platform-fees');
    await expect(page).toHaveURL(/\/dashboard\/admin\/platform-fees/);
    await expect(page.getByRole('heading', { name: /platform fees/i }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('shows fee rules or empty state', async ({ page }) => {
    await page.goto('/dashboard/admin/platform-fees');
    await expect(page).toHaveURL(/\/dashboard\/admin\/platform-fees/);

    await expect
      .poll(
        async () => {
          const rowCount = await page.locator('table tbody tr').count();
          const emptyCount = await page.getByRole('heading', { name: /no fee rules/i }).count();
          return rowCount > 0 || emptyCount > 0;
        },
        { timeout: 15_000 },
      )
      .toBe(true);
  });

  test('add fee rule button is present', async ({ page }) => {
    await page.goto('/dashboard/admin/platform-fees');
    await expect(page).toHaveURL(/\/dashboard\/admin\/platform-fees/);
    await expect(page.getByRole('button', { name: /add fee rule/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});
