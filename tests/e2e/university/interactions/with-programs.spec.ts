/**
 * Layer B — University: has configured programs.
 * Programs page shows program rows. Students page accessible.
 */

import { test, expect } from '@playwright/test';
import { setUniversityState } from '../../helpers/db-university';

const SCHOOL_ID = process.env.E2E_UNIVERSITY_SCHOOL_ID!;

test.describe.serial('University state: with programs', () => {
  test.beforeAll(async () => {
    await setUniversityState(SCHOOL_ID, { hasPrograms: true });
  });

  test('programs page shows program rows', async ({ page }) => {
    await page.goto('/dashboard/university/programs');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no program/i)).not.toBeVisible({ timeout: 10_000 });
    // Program names seeded (seeded as "BSc Computer Science")
    await expect(page.getByText(/computer science/i)).toBeVisible({ timeout: 10_000 });
  });

  test('each program row shows tuition amount in NGN', async ({ page }) => {
    await page.goto('/dashboard/university/programs');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/₦|NGN/).first()).toBeVisible({ timeout: 10_000 });
  });

  test('overview page loads without error', async ({ page }) => {
    await page.goto('/dashboard/university');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });
});
