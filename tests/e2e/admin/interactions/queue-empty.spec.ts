/**
 * Layer B — Admin: queue empty state.
 * Operations page shows "Queue empty" empty state when no pending docs.
 */

import { test, expect } from '@playwright/test';
import { setAdminViewState } from '../../helpers/db-admin';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Admin state: queue empty', () => {
  test.beforeAll(async () => {
    await setAdminViewState(STUDENT_ID, { queueHasItem: false });
  });

  test('operations page shows empty state', async ({ page }) => {
    await page.goto('/dashboard/admin/operations');
    await page.waitForLoadState('networkidle');
    // Empty state heading (matches admin copy)
    await expect(page.getByRole('heading', { name: /queue/i, level: 1 })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/queue.*empty|no.*pending|all.*clear/i)).toBeVisible({ timeout: 10_000 });
  });

  test('no document rows in the queue table', async ({ page }) => {
    await page.goto('/dashboard/admin/operations');
    await page.waitForLoadState('networkidle');
    // If a table is present, it should have 0 data rows
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    // Either no table (empty state shown) or 0 rows
    expect(count).toBe(0);
  });
});
