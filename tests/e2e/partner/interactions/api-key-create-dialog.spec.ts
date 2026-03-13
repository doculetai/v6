/**
 * Layer E — Partner API keys: create dialog opens on trigger.
 * The "Create new key" button is always visible when under the 3-key limit.
 * Clicking it must open a dialog with "Create API key" title.
 */

import { test, expect } from '@playwright/test';
import { setPartnerState } from '../../helpers/db-partner';

const PARTNER_PROFILE_ID = process.env.E2E_PARTNER_PROFILE_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Triggered: partner API key create dialog', () => {
  test.beforeAll(async () => {
    // No keys → under limit → "Create new key" button is visible
    await setPartnerState(PARTNER_PROFILE_ID, STUDENT_ID, {
      hasApiKeys: false,
      hasStudents: false,
    });
  });

  test('"Create new key" button is visible', async ({ page }) => {
    await page.goto('/dashboard/partner/api-keys');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: /create new key/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('clicking "Create new key" opens the dialog', async ({ page }) => {
    await page.goto('/dashboard/partner/api-keys');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /create new key/i }).first().click();
    await expect(
      page.getByRole('dialog'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('create dialog has "Create API key" title', async ({ page }) => {
    await page.goto('/dashboard/partner/api-keys');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /create new key/i }).first().click();
    await expect(
      page.getByRole('heading', { name: /create api key/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('create dialog has a key name input', async ({ page }) => {
    await page.goto('/dashboard/partner/api-keys');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /create new key/i }).first().click();
    await expect(
      page.getByRole('textbox'),
    ).toBeVisible({ timeout: 10_000 });
  });
});
