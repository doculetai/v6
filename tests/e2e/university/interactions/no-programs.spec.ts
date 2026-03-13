/**
 * Layer B — University: no programs configured.
 * Programs page shows empty state with CTA to add programs.
 */

import { test, expect } from '@playwright/test';
import { setUniversityState } from '../../helpers/db-university';

const SCHOOL_ID = process.env.E2E_UNIVERSITY_SCHOOL_ID!;

test.describe.serial('University state: no programs', () => {
  test.beforeAll(async () => {
    await setUniversityState(SCHOOL_ID, { hasPrograms: false });
  });

  test('programs page shows empty state', async ({ page }) => {
    await page.goto('/dashboard/university/programs');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no program|add.*program/i)).toBeVisible({ timeout: 10_000 });
  });

  test('programs empty state has an add CTA', async ({ page }) => {
    await page.goto('/dashboard/university/programs');
    await page.waitForLoadState('networkidle');
    // Empty state CTA button
    const cta = page.getByRole('button', { name: /add.*program/i }).or(
      page.getByRole('link', { name: /add.*program/i }),
    ).first();
    await expect(cta).toBeVisible({ timeout: 10_000 });
  });
});
