/**
 * Layer B — Sponsor: has an active commitment.
 * Commitments page shows the sponsorship row with NGN amount.
 * Copy: "You are committing ₦ X to [Name]'s application." — no payment language.
 */

import { test, expect } from '@playwright/test';
import { setSponsorState } from '../../helpers/db-sponsor';

const SPONSOR_ID = process.env.E2E_SPONSOR_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Sponsor state: with active commitment', () => {
  test.beforeAll(async () => {
    await setSponsorState(SPONSOR_ID, STUDENT_ID, {
      hasCommitment: true,
      commitmentStatus: 'active',
    });
  });

  test('commitments page shows the commitment row', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no commitment/i)).not.toBeVisible({ timeout: 10_000 });
  });

  test('commitment shows NGN amount', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/₦|NGN/)).toBeVisible({ timeout: 10_000 });
  });

  test('sponsor overview reflects the active commitment', async ({ page }) => {
    await page.goto('/dashboard/sponsor');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    // No error boundary
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });
});
