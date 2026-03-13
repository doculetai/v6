/**
 * Layer E — Student settings: MFA QR code visible on trigger.
 * MFASettingsCard lives directly on the settings page (no tab click needed).
 * Clicking "Enable two-factor authentication" must render a base64 QR img.
 * beforeAll/afterAll purge auth.mfa_factors so tests are idempotent.
 */

import { test, expect } from '@playwright/test';
import { unenrollMfaFactors } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Triggered: MFA QR code render', () => {
  test.beforeAll(async () => {
    await unenrollMfaFactors(STUDENT_ID);
  });

  test.afterAll(async () => {
    await unenrollMfaFactors(STUDENT_ID);
  });

  test('MFA card renders on settings page', async ({ page }) => {
    await page.goto('/dashboard/student/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Two-factor authentication')).toBeVisible({ timeout: 10_000 });
  });

  test('MFA disabled state shows enable button', async ({ page }) => {
    await page.goto('/dashboard/student/settings');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: 'Enable two-factor authentication' }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('clicking enable renders QR code image', async ({ page }) => {
    await page.goto('/dashboard/student/settings');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Enable two-factor authentication' }).click();
    // Supabase mfa.enroll() returns an SVG; the card converts it to a data URL
    await expect(
      page.locator('img[src^="data:image/svg+xml;base64"]'),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('QR code state shows scan instruction text', async ({ page }) => {
    await page.goto('/dashboard/student/settings');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Enable two-factor authentication' }).click();
    await expect(
      page.getByText('Scan this QR code with your authenticator app.'),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('QR code state shows verification code input', async ({ page }) => {
    await page.goto('/dashboard/student/settings');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Enable two-factor authentication' }).click();
    await expect(
      page.getByRole('button', { name: 'Verify and enable' }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
