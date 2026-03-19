import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: documents complete', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: true,
      onboardingComplete: true, documentStatus: 'approved', certificateIssued: false,
    });
  });

  test('profile setup + bank statement complete; certificate stage in progress', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    // Profile setup and Bank statement stages should be Complete
    await expect(
      page.locator('li').filter({ hasText: 'Profile setup' }).getByText('Complete'),
    ).toBeVisible({ timeout: 10_000 });
    // 'Documents' is the stage label (not 'Bank statement')
    await expect(
      page.locator('li').filter({ hasText: 'Documents' }).getByText('Complete'),
    ).toBeVisible({ timeout: 10_000 });
    // Certificate stage is next (In progress)
    await expect(
      page.locator('li').filter({ hasText: 'Certificate' }).getByText('In progress'),
    ).toBeVisible({ timeout: 10_000 });
  });
});
