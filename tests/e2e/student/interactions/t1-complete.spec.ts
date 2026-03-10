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

  test('T1 ticked, T2 expanded, T3 dimmed — no lock icon', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-tier="1"]'))
      .toHaveAttribute('data-status', 'verified', { timeout: 10_000 });
    // T2 expanded as current — unblocked by T1 completion
    await expect(page.locator('[data-tier="2"]'))
      .toHaveAttribute('data-status', 'current', { timeout: 10_000 });
    // T3 visible but no lock icon (CLAUDE.md: "no lock icon")
    await expect(page.locator('[data-tier="3"]')).toBeVisible();
    await expect(
      page.locator('[data-tier="3"] [data-testid="lock-icon"]'),
    ).toHaveCount(0);
  });
});
