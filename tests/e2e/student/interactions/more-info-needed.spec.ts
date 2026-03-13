/**
 * Layer B — Student: document needs more information.
 * Triggers the same "action required" banner as rejected but with different
 * copy — the note says what additional information is needed.
 * CLAUDE.md: "more_info_needed" is a valid document status. No apologetic copy.
 */

import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;
const NOTE = 'Please upload a clearer copy showing account name and balance.';

test.describe.serial('Journey state: document more info needed', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      onboardingComplete: true,
      t1PhoneVerified: true,
      t2KycVerified: true,
      t3BankVerified: false,
      documentStatus: 'more_info_requested',
      rejectionReason: NOTE,
      certificateIssued: false,
    });
  });

  test('documents page shows the admin note verbatim', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(NOTE)).toBeVisible({ timeout: 10_000 });
  });

  test('resubmit CTA is present', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: /resubmit/i }).or(page.getByRole('link', { name: /resubmit/i })),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('overview shows "action required" banner', async ({ page }) => {
    await page.goto('/dashboard/student/overview');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/action required|more info|attention/i)).toBeVisible({ timeout: 10_000 });
  });

  test('no apologetic language in more-info state', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await page.waitForLoadState('networkidle');
    const content = await page.getByRole('main').textContent() ?? '';
    expect(content.toLowerCase()).not.toMatch(/oops|sorry about that|something went wrong|we couldn't quite/);
  });
});
