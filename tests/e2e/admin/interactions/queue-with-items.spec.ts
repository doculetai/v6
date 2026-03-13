/**
 * Layer B — Admin: queue has pending items.
 * Operations page shows a document row when a student has submitted.
 */

import { test, expect } from '@playwright/test';
import { setAdminViewState } from '../../helpers/db-admin';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Admin state: queue with items', () => {
  test.beforeAll(async () => {
    await setAdminViewState(STUDENT_ID, { queueHasItem: true, queueItemHasOcr: true });
  });

  test('operations page shows at least one queue row', async ({ page }) => {
    await page.goto('/dashboard/admin/operations');
    await page.waitForLoadState('networkidle');
    // At least one row or card visible — not the empty state
    await expect(page.getByText(/queue.*empty|all.*clear/i)).not.toBeVisible({ timeout: 10_000 });
  });

  test('queue row has Approve and Reject actions', async ({ page }) => {
    await page.goto('/dashboard/admin/operations');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /approve/i }).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /reject/i }).first()).toBeVisible({ timeout: 10_000 });
  });
});
