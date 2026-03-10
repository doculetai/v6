import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: proof ready', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: true,
      onboardingComplete: true, documentStatus: 'approved', certificateIssued: true,
    });
  });

  test('proof page H1 is "Proof of Funds Certificate"', async ({ page }) => {
    await page.goto('/dashboard/student/proof');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: /proof of funds certificate/i, level: 1 }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('"Download PDF" and "Share" CTAs both visible', async ({ page }) => {
    await page.goto('/dashboard/student/proof');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: /download pdf/i }).or(page.getByRole('link', { name: /download pdf/i })),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /share/i })).toBeVisible();
  });

  test('History tab present', async ({ page }) => {
    await page.goto('/dashboard/student/proof');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('tab', { name: /history/i })).toBeVisible({ timeout: 10_000 });
  });

  test('overview H1 is "Your proof of funds is verified."', async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
    // CLAUDE.md: "Post-cert Overview: H1 'Your proof of funds is verified.'"
    await expect(
      page.getByRole('heading', { name: /your proof of funds is verified/i, level: 1 }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
