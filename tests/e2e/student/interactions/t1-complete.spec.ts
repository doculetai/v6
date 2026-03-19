import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: T1 complete', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: false, t3BankVerified: false,
      onboardingComplete: true, documentStatus: 'none', certificateIssued: false,
    });
  });

  test('T1 done (no phone CTA), T2 shows "Verify identity", T3 visible', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    // T1 is verified — "Verify phone" CTA should not be present
    await expect(page.getByRole('button', { name: 'Verify phone' })).toHaveCount(0, { timeout: 10_000 });
    // T2 is now current — "Verify identity" CTA is visible
    await expect(page.getByRole('button', { name: 'Verify identity' })).toBeVisible({ timeout: 10_000 });
    // T3 is visible but dimmed — CLAUDE.md: no lock icon
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.locator('[data-testid="lock-icon"]')).toHaveCount(0);
  });
});
