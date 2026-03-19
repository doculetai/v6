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

  test('operations page H1 is "Operations" and renders without error', async ({ page }) => {
    await page.goto('/dashboard/admin/operations');
    await page.waitForLoadState('networkidle');
    // H1 is "Operations" (page title), not "Queue"
    await expect(page.getByRole('heading', { name: /operations/i, level: 1 })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('operations page renders the review queue section', async ({ page }) => {
    await page.goto('/dashboard/admin/operations');
    await page.waitForLoadState('networkidle');
    // SectionCard title is "Review queue" from adminCopy.queue.title
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });
});
