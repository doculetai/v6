import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: under final review', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: true,
      onboardingComplete: true, documentStatus: 'approved', certificateIssued: false,
    });
  });

  test('"Under final review" message visible, no action CTA', async ({ page }) => {
    await page.goto('/dashboard/student/proof');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/under final review/i)).toBeVisible({ timeout: 10_000 });
    // CLAUDE.md: "No action, no countdown" — buttons must not exist in this state
    await expect(page.getByRole('button', { name: /download/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /share/i })).toHaveCount(0);
  });

  test('no SLA copy (no countdown, no X days)', async ({ page }) => {
    await page.goto('/dashboard/student/proof');
    await page.waitForLoadState('networkidle');
    const content = await page.getByRole('main').textContent() ?? '';
    // CLAUDE.md: "never use: within 24 hours, within 2 business days, shortly, soon"
    expect(content).not.toMatch(/within \d+|business day|shortly|soon|\d+ hour/i);
  });
});
