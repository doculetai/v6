/**
 * E2E: Sponsor invite flow — student invite form on verification page (uses seeded student auth).
 */

import { test, expect } from '@playwright/test';

test.describe('Sponsor invite', () => {
  test.use({ storageState: 'tests/e2e/.auth/student.json' });

  test('verification page shows invite sponsor card with form', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await expect(page).toHaveURL(/\/dashboard\/student\/verification/);
    await expect(
      page.getByRole('heading', { name: /invite.*sponsor|sponsor.*invitation/i }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /send invitation/i })).toBeVisible();
  });
});
