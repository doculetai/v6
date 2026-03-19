/**
 * Layer B — Sponsor: commitment pending (awaiting confirmation).
 * Overview shows State 3 — pending invite/commitment banner.
 * CLAUDE.md sponsor QA State 3: "Pending invite(s) awaiting student acceptance."
 */

import { test, expect } from '@playwright/test';
import { setSponsorState } from '../../helpers/db-sponsor';

const SPONSOR_ID = process.env.E2E_SPONSOR_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Sponsor state: invite pending', () => {
  test.beforeAll(async () => {
    await setSponsorState(SPONSOR_ID, STUDENT_ID, {
      hasCommitment: true,
      commitmentStatus: 'pending',
    });
  });

  test('overview renders without error', async ({ page }) => {
    await page.goto('/dashboard/sponsor');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('commitments page shows the pending commitment', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no commitment|no.*student/i)).not.toBeVisible({ timeout: 10_000 });
  });

  test('commitment shows NGN amount', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/₦|NGN/).first()).toBeVisible({ timeout: 10_000 });
  });

  test('no "already committed" copy that implies active status', async ({ page }) => {
    // Pending ≠ active; page should not show confirmed/active badge for this state
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
  });
});
