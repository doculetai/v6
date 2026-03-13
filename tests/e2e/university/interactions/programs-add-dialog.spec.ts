/**
 * Layer E — University programs: add program dialog opens on trigger.
 * The "Add program" button in PageHeader always renders.
 * Clicking it must open a dialog with "Add program" title and a name input.
 */

import { test, expect } from '@playwright/test';
import { setUniversityState } from '../../helpers/db-university';

const SCHOOL_ID = process.env.E2E_UNIVERSITY_SCHOOL_ID!;

test.describe.serial('Triggered: university add program dialog', () => {
  test.beforeAll(async () => {
    // Start with no programs so the empty state is visible alongside the header button
    await setUniversityState(SCHOOL_ID, { hasPrograms: false });
  });

  test('"Add program" button is visible in page header', async ({ page }) => {
    await page.goto('/dashboard/university/programs');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('button', { name: 'Add program' }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('clicking "Add program" opens the dialog', async ({ page }) => {
    await page.goto('/dashboard/university/programs');
    await page.waitForLoadState('networkidle');
    // Click header button (first match)
    await page.getByRole('button', { name: 'Add program' }).first().click();
    await expect(
      page.getByRole('dialog'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('add program dialog has "Add program" title', async ({ page }) => {
    await page.goto('/dashboard/university/programs');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Add program' }).first().click();
    await expect(
      page.getByRole('heading', { name: 'Add program' }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('add program dialog has program name input', async ({ page }) => {
    await page.goto('/dashboard/university/programs');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Add program' }).first().click();
    await expect(
      page.locator('#prog-name'),
    ).toBeVisible({ timeout: 10_000 });
  });
});
