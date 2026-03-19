/**
 * Layer B — Sponsor commitments: active commitment renders correctly.
 * The DataTable renders commitment rows with status badges but no action buttons.
 * Tests verify the page renders with expected data for an active commitment.
 */

import { test, expect } from '@playwright/test';
import { setSponsorState } from '../../helpers/db-sponsor';

const SPONSOR_ID = process.env.E2E_SPONSOR_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Sponsor: active commitment page', () => {
  test.beforeAll(async () => {
    await setSponsorState(SPONSOR_ID, STUDENT_ID, {
      hasCommitment: true,
      commitmentStatus: 'active',
    });
  });

  test('commitments page renders without error', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('"Active" status badge is visible', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Active')).toBeVisible({ timeout: 10_000 });
  });

  test('NGN amount is visible for the active commitment', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/₦/).first()).toBeVisible({ timeout: 10_000 });
  });

  test('no confirmation modal open by default', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    // AlertDialog is closed by default (open={false})
    await expect(page.getByRole('alertdialog')).not.toBeVisible();
  });
});
