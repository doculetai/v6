/**
 * E2E: Student onboarding — redirects or shows wizard (uses seeded student auth).
 */

import { test, expect } from '@playwright/test';

test.describe('Student onboarding', () => {
  test.use({ storageState: 'tests/e2e/.auth/student.json' });

  test('onboarding or dashboard loads', async ({ page }) => {
    await page.goto('/dashboard/student/onboarding');
    await expect(page).toHaveURL(/\/(dashboard\/student|onboarding)/);
    await expect(
      page.getByRole('heading', { name: /onboarding|overview|proof journey|school|program/i }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
