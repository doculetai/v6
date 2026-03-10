import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: first session', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: false, t2KycVerified: false, t3BankVerified: false,
      onboardingComplete: false, documentStatus: 'none', certificateIssued: false,
    });
  });

  test('shows "Begin your application" card', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/begin your application/i)).toBeVisible({ timeout: 10_000 });
  });

  test('all 4 journey stages show upcoming (none completed)', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-stage-status="completed"]')).toHaveCount(0, { timeout: 10_000 });
  });

  test('nextAction CTA links to /dashboard/student/setup', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    const cta = page.getByRole('link', { name: /set up your profile/i }).first();
    await expect(cta).toBeVisible({ timeout: 10_000 });
    await cta.click();
    await expect(page).toHaveURL(/\/dashboard\/student\/setup/, { timeout: 10_000 });
  });
});
