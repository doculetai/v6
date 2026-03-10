import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: verification complete', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: true,
      onboardingComplete: true, documentStatus: 'none', certificateIssued: false,
    });
  });

  test('stage 2 completed, stage 3 current, CTA = "Upload statement"', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-stage-id="verification"]'))
      .toHaveAttribute('data-stage-status', 'completed', { timeout: 10_000 });
    await expect(page.locator('[data-stage-id="documents"]'))
      .toHaveAttribute('data-stage-status', 'current');
    await expect(
      page.getByRole('link', { name: /upload statement/i }).first(),
    ).toBeVisible();
  });
});
