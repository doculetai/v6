import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: T2 complete', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: false,
      onboardingComplete: true, documentStatus: 'none', certificateIssued: false,
    });
  });

  test('T1+T2 ticked, T3 shows both choice cards (no dropdown)', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-tier="2"]'))
      .toHaveAttribute('data-status', 'verified', { timeout: 10_000 });
    // Both options first-class (CLAUDE.md: "side-by-side choice cards, both first-class")
    await expect(page.getByText(/connect bank/i)).toBeVisible();
    await expect(page.getByText(/upload.*statement/i)).toBeVisible();
    // Not a dropdown
    await expect(page.locator('[data-tier="3"] select')).toHaveCount(0);
  });
});
