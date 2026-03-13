/**
 * Layer B — Student: sponsor invite pending.
 * The student has sent an invite to a potential sponsor and the invite
 * is still pending acceptance. Overview and Proof page reflect this.
 */

import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: sponsor invite pending', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      onboardingComplete: true,
      t1PhoneVerified: true,
      t2KycVerified: true,
      t3BankVerified: true,
      documentStatus: 'approved',
      certificateIssued: false,
      sponsorInvitePending: true,
    });
  });

  test('overview renders without error', async ({ page }) => {
    await page.goto('/dashboard/student/overview');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('proof of funds page renders without error', async ({ page }) => {
    await page.goto('/dashboard/student/proof');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('no certificate issued copy shown (cert not yet issued)', async ({ page }) => {
    await page.goto('/dashboard/student/overview');
    await page.waitForLoadState('networkidle');
    const content = await page.getByRole('main').textContent() ?? '';
    expect(content).not.toMatch(/certificate.*ready|proof.*verified/i);
  });
});
