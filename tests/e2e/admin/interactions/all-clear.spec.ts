/**
 * Layer B — Admin: all-clear state.
 * Queue is empty and no items need review.
 * Operations page shows the empty state ("all documents have been reviewed").
 * CLAUDE.md: admin overview CTA derives from computeAdminJourney() which
 * reflects queue depth — zero queue = platform_health stage active.
 */

import { test, expect } from '@playwright/test';
import { setAdminViewState } from '../../helpers/db-admin';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Admin state: all clear', () => {
  test.beforeAll(async () => {
    await setAdminViewState(STUDENT_ID, { queueHasItem: false, allClear: true });
  });

  test('operations page renders without error', async ({ page }) => {
    await page.goto('/dashboard/admin/operations');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /operations/i, level: 1 })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('no approve/reject buttons visible (nothing to review)', async ({ page }) => {
    await page.goto('/dashboard/admin/operations');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /approve/i })).toHaveCount(0, { timeout: 10_000 });
  });

  test('admin overview renders without error', async ({ page }) => {
    await page.goto('/dashboard/admin/overview');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('risk page renders without error (no flags)', async ({ page }) => {
    await page.goto('/dashboard/admin/risk');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });
});
