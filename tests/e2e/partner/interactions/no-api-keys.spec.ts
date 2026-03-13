/**
 * Layer B — Partner: no API keys created.
 * API Keys page shows empty state with CTA to create first key.
 */

import { test, expect } from '@playwright/test';
import { setPartnerState } from '../../helpers/db-partner';

const PARTNER_PROFILE_ID = process.env.E2E_PARTNER_PROFILE_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Partner state: no API keys', () => {
  test.beforeAll(async () => {
    await setPartnerState(PARTNER_PROFILE_ID, STUDENT_ID, {
      hasApiKeys: false,
      hasStudents: false,
    });
  });

  test('api-keys page shows empty state', async ({ page }) => {
    await page.goto('/dashboard/partner/api-keys');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no.*key|create.*key|get started/i)).toBeVisible({ timeout: 10_000 });
  });

  test('api-keys empty state has create CTA', async ({ page }) => {
    await page.goto('/dashboard/partner/api-keys');
    await page.waitForLoadState('networkidle');
    const cta = page
      .getByRole('button', { name: /create.*key|generate.*key|new.*key/i })
      .or(page.getByRole('link', { name: /create.*key|new.*key/i }))
      .first();
    await expect(cta).toBeVisible({ timeout: 10_000 });
  });

  test('students page shows empty state', async ({ page }) => {
    await page.goto('/dashboard/partner/students');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no student/i)).toBeVisible({ timeout: 10_000 });
  });
});
