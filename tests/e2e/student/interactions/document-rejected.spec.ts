import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;
const NOTE = 'Balance below required minimum. Resubmit with correct statement.';

test.describe.serial('Journey state: document rejected', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: false,
      onboardingComplete: true, documentStatus: 'rejected', rejectionReason: NOTE,
      certificateIssued: false,
    });
  });

  test('rejection note shown verbatim, Resubmit CTA present', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await page.waitForLoadState('networkidle');
    // CLAUDE.md: "Reject (written note shown verbatim to student)"
    await expect(page.getByText(NOTE)).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole('button', { name: /resubmit/i }).or(page.getByRole('link', { name: /resubmit/i })),
    ).toBeVisible();
  });

  test('no apologetic language in rejection state', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await page.waitForLoadState('networkidle');
    const content = await page.getByRole('main').textContent() ?? '';
    expect(content.toLowerCase()).not.toMatch(/oops|sorry about that|something went wrong|we couldn't quite/);
  });

  test('no "cancel submission" on rejected doc (only on pending)', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /cancel submission/i })).toHaveCount(0, { timeout: 10_000 });
  });
});
