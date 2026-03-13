/**
 * Layer E — Student verification: KycIdentitySheet opens via retry trigger.
 * T2 status is 'failed' — "Resubmit identity" CTA opens the same sheet.
 * Confirms the retry path re-renders the KYC form without error.
 */

import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Triggered: KYC identity retry sheet', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      onboardingComplete: true,
      t1PhoneVerified: true,
      t2KycVerified: false,
      t2KycFailed: true,
      t3BankVerified: false,
      documentStatus: 'none',
      certificateIssued: false,
    });
  });

  test('T2 failed state shows "Resubmit identity" CTA', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: /resubmit identity/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('clicking "Resubmit identity" opens the KYC sheet', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /resubmit identity/i }).click();
    await expect(
      page.getByText('Verify your identity'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('retry sheet has identity number input', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /resubmit identity/i }).click();
    await expect(
      page.getByLabel('Identity number'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('retry sheet does not show apologetic copy', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    const content = await page.getByRole('main').textContent() ?? '';
    expect(content.toLowerCase()).not.toMatch(/oops|sorry about that|something went wrong/);
  });
});
