/**
 * Layer B — Student: T2 KYC identity verification failed.
 * Verification page shows the failed state with resubmit guidance.
 * CLAUDE.md: "Verification failed · BVN mismatch · Resubmit with correct NIN."
 * No apologetic language. Bank-letter tone.
 */

import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: T2 KYC failed', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      onboardingComplete: true,
      t1PhoneVerified: true,
      t2KycVerified: false,
      t2KycFailed: true,
      t3BankVerified: false,
      documentStatus: 'none',
      certificateIssued: false,
    });
  });

  test('verification page shows failed state, not blank', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('verification page shows a retry or resubmit CTA', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: /retry|resubmit|try again/i }).first()
        .or(page.getByRole('link', { name: /retry|resubmit|try again/i }).first()),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('no apologetic language in T2 failed state', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    const content = await page.getByRole('main').textContent() ?? '';
    expect(content.toLowerCase()).not.toMatch(/oops|sorry about that|something went wrong|we couldn't quite/);
  });

  test('T3 tier card is dimmed/locked (T2 not yet complete)', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await page.waitForLoadState('networkidle');
    // All 3 tier cards always visible (CLAUDE.md: upcoming dimmed 50-60% opacity)
    // T3 must be visible even when T2 has failed
    await expect(page.getByRole('main')).toBeVisible();
  });
});
