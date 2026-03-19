import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: onboarding complete', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: false, t2KycVerified: false, t3BankVerified: false,
      onboardingComplete: true, documentStatus: 'none', certificateIssued: false,
    });
  });

  test('stage 1 completed, stage 2 current', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    // JourneyProgress renders 'Complete' sub-label for completed stages
    await expect(
      page.locator('li').filter({ hasText: 'Profile setup' }).getByText('Complete'),
    ).toBeVisible({ timeout: 10_000 });
    // Phone stage is next (current = 'In progress'); label is 'Phone' not 'Phone verification'
    await expect(
      page.locator('li').filter({ hasText: 'Phone' }).getByText('In progress'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('nextAction CTA is "Verify phone"', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('link', { name: /verify phone/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
