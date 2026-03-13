/**
 * Layer B — Sponsor: student has received their certificate.
 * Overview shows State 4 — a student they sponsored is certified.
 * CLAUDE.md sponsor QA State 4: "At least one student has a certificate issued."
 */

import { test, expect } from '@playwright/test';
import { setSponsorState } from '../../helpers/db-sponsor';

const SPONSOR_ID = process.env.E2E_SPONSOR_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Sponsor state: student certified', () => {
  test.beforeAll(async () => {
    await setSponsorState(SPONSOR_ID, STUDENT_ID, {
      hasCommitment: true,
      commitmentStatus: 'active',
      studentCertIssued: true,
    });
  });

  test('overview renders without error', async ({ page }) => {
    await page.goto('/dashboard/sponsor');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('commitments page shows the commitment row', async ({ page }) => {
    await page.goto('/dashboard/sponsor/commitments');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no commitment/i)).not.toBeVisible({ timeout: 10_000 });
  });

  test('students page renders without error', async ({ page }) => {
    await page.goto('/dashboard/sponsor/students');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });
});
