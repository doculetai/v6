/**
 * Layer B — Sponsor: no commitments.
 * Commitments page shows empty state. Overview shows "get started" prompt.
 */

import { test, expect } from '@playwright/test';
import { setSponsorState } from '../../helpers/db-sponsor';

const SPONSOR_ID = process.env.E2E_SPONSOR_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Sponsor state: no commitments', () => {
  test.beforeAll(async () => {
    await setSponsorState(SPONSOR_ID, STUDENT_ID, { hasCommitment: false });
  });

  test('commitments page shows empty state', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/commit to a student|fund their education|no commitment/i)).toBeVisible({ timeout: 10_000 });
  });

  test('students page shows empty state', async ({ page }) => {
    await page.goto('/dashboard/sponsor/students');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no student/i)).toBeVisible({ timeout: 10_000 });
  });
});
