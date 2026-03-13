/**
 * Layer E — Sponsor commitments: confirm modal opens on trigger.
 * A pending commitment row shows a "Commit" button.
 * Clicking it must open the AlertDialog with title "Confirm commitment".
 * Copy rule: "This is not a payment." must appear in the modal body.
 */

import { test, expect } from '@playwright/test';
import { setSponsorState } from '../../helpers/db-sponsor';

const SPONSOR_ID = process.env.E2E_SPONSOR_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Triggered: sponsor commitment confirm modal', () => {
  test.beforeAll(async () => {
    await setSponsorState(SPONSOR_ID, STUDENT_ID, {
      hasCommitment: true,
      commitmentStatus: 'pending',
    });
  });

  test('commitments page shows "Commit" action button', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: 'Commit' }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('clicking "Commit" opens the confirmation modal', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Commit' }).first().click();
    await expect(
      page.getByText('Confirm commitment'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('modal body states "This is not a payment"', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Commit' }).first().click();
    await expect(
      page.getByText(/This is not a payment/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('modal has Cancel button', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Commit' }).first().click();
    await expect(
      page.getByRole('button', { name: 'Cancel' }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
