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

  test('all 3 stages completed, proof stage current', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    for (const stage of ['onboarding', 'verification', 'documents']) {
      await expect(page.locator(`[data-stage-id="${stage}"]`))
        .toHaveAttribute('data-stage-status', 'completed', { timeout: 10_000 });
    }
    await expect(page.locator('[data-stage-id="proof"]'))
      .toHaveAttribute('data-stage-status', 'current', { timeout: 10_000 });
  });
});
