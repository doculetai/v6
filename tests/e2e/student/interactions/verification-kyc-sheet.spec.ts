/**
 * Layer E — Student verification: KycIdentitySheet opens on trigger.
 * T2 status is 'active' when T1 verified but T2 not started.
 * Clicking "Verify identity" must open the bottom sheet with BVN/NIN select.
 */

import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Triggered: KYC identity sheet', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      onboardingComplete: true,
      t1PhoneVerified: true,
      t2KycVerified: false,
      t3BankVerified: false,
      documentStatus: 'none',
      certificateIssued: false,
    });
  });

  test('T2 "Verify identity" CTA is present when T1 done', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: 'Verify identity' }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('clicking "Verify identity" opens the KYC sheet', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Verify identity' }).click();
    await expect(
      page.getByText('Verify your identity'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('KYC sheet has identity type selector (BVN/NIN/passport tab buttons)', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Verify identity' }).click();
    // KycIdentitySheet uses tab buttons for BVN/NIN/Passport selection (not a combobox)
    await expect(
      page.getByRole('button', { name: /BVN|NIN|Passport/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('KYC sheet has identity number input', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Verify identity' }).click();
    // Default tab is BVN; label is type-specific ('BVN Number', 'NIN Number', 'Passport Number')
    await expect(
      page.getByLabel(/BVN Number|NIN Number|Passport Number/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('KYC sheet privacy note: data never stored by Doculet', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Verify identity' }).click();
    await expect(
      page.getByText(/never stored by Doculet/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});
