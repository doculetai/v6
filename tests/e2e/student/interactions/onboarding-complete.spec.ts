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
    await expect(page.locator('[data-stage-id="onboarding"]'))
      .toHaveAttribute('data-stage-status', 'completed', { timeout: 10_000 });
    await expect(page.locator('[data-stage-id="verification"]'))
      .toHaveAttribute('data-stage-status', 'current', { timeout: 10_000 });
  });

  test('nextAction CTA is "Continue verification"', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('link', { name: /continue verification/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
