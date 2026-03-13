/**
 * Layer E — Sponsor commitments: uncommit modal opens on trigger.
 * An active commitment row shows a "Remove commitment" button.
 * Clicking it must open the AlertDialog with title "Remove commitment".
 * Copy rule: the modal must warn before removing an active commitment.
 */

import { test, expect } from '@playwright/test';
import { setSponsorState } from '../../helpers/db-sponsor';

const SPONSOR_ID = process.env.E2E_SPONSOR_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Triggered: sponsor uncommit modal', () => {
  test.beforeAll(async () => {
    await setSponsorState(SPONSOR_ID, STUDENT_ID, {
      hasCommitment: true,
      commitmentStatus: 'active',
    });
  });

  test('commitments page shows "Remove commitment" action button', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: 'Remove commitment' }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('clicking "Remove commitment" opens the modal', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Remove commitment' }).first().click();
    await expect(
      page.getByText('Remove commitment'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('uncommit modal has Cancel button', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Remove commitment' }).first().click();
    await expect(
      page.getByRole('button', { name: 'Cancel' }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('uncommit modal has confirm destructive button', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Remove commitment' }).first().click();
    // AlertDialog has two buttons: Cancel and the confirm action
    const buttons = page.getByRole('button');
    await expect(buttons).toHaveCount(2, { timeout: 10_000 });
  });
});
