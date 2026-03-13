/**
 * Layer E — Student verification: PhoneVerificationSheet opens on trigger.
 * T1 status is 'active' when phone not verified and onboarding is done.
 * Clicking "Verify phone" must open the bottom sheet with phone input.
 */

import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Triggered: phone verification sheet', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      onboardingComplete: true,
      t1PhoneVerified: false,
      t2KycVerified: false,
      t3BankVerified: false,
      documentStatus: 'none',
      certificateIssued: false,
    });
  });

  test('T1 "Verify phone" CTA is present on verification page', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: 'Verify phone' }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('clicking "Verify phone" opens the phone sheet', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Verify phone' }).click();
    await expect(
      page.getByText('Confirm your phone number'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('phone sheet has phone number input field', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Verify phone' }).click();
    await expect(page.locator('#phone-input')).toBeVisible({ timeout: 10_000 });
  });

  test('phone sheet has "Send code" submit button', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Verify phone' }).click();
    await expect(
      page.getByRole('button', { name: 'Send code' }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
