/**
 * Layer B — Partner: has an active API key and a verified student.
 * API Keys page shows key row. Students page shows verified student.
 */

import { test, expect } from '@playwright/test';
import { setPartnerState } from '../../helpers/db-partner';

const PARTNER_PROFILE_ID = process.env.E2E_PARTNER_PROFILE_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Partner state: with API keys', () => {
  test.beforeAll(async () => {
    await setPartnerState(PARTNER_PROFILE_ID, STUDENT_ID, {
      hasApiKeys: true,
      hasStudents: true,
    });
  });

  test('api-keys page shows key row (not empty)', async ({ page }) => {
    await page.goto('/dashboard/partner/api-keys');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no.*key|get started/i)).not.toBeVisible({ timeout: 10_000 });
  });

  test('api key row shows masked key prefix', async ({ page }) => {
    await page.goto('/dashboard/partner/api-keys');
    await page.waitForLoadState('networkidle');
    // Key prefix is visible (dk_live_e2e)
    await expect(page.getByText(/dk_live/i)).toBeVisible({ timeout: 10_000 });
  });

  test('students page shows verified student row', async ({ page }) => {
    await page.goto('/dashboard/partner/students');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no student/i)).not.toBeVisible({ timeout: 10_000 });
  });

  test('overview loads without error', async ({ page }) => {
    await page.goto('/dashboard/partner');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });
});
