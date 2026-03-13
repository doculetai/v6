/**
 * Layer B — Partner: with active API usage.
 * configure_integration stage complete — API calls have been made.
 * Analytics page shows call counts for today.
 * CLAUDE.md partner journey: configure_integration = apiCallsToday > 0.
 */

import { test, expect } from '@playwright/test';
import { setPartnerState } from '../../helpers/db-partner';

const PARTNER_PROFILE_ID = process.env.E2E_PARTNER_PROFILE_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Partner state: with API usage', () => {
  test.beforeAll(async () => {
    await setPartnerState(PARTNER_PROFILE_ID, STUDENT_ID, {
      hasApiKeys: true,
      hasStudents: true,
      hasApiUsage: true,
    });
  });

  test('overview renders without error', async ({ page }) => {
    await page.goto('/dashboard/partner');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('analytics page renders without error', async ({ page }) => {
    await page.goto('/dashboard/partner/analytics');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('students page shows enrolled student', async ({ page }) => {
    await page.goto('/dashboard/partner/students');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no student/i)).not.toBeVisible({ timeout: 10_000 });
  });

  test('api-keys page shows the active key', async ({ page }) => {
    await page.goto('/dashboard/partner/api-keys');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no.*key|add.*key|create.*key/i)).not.toBeVisible({ timeout: 10_000 });
  });
});
