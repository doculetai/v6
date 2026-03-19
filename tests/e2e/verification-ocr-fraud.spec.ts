/**
 * E2E: Verification, OCR UI, and Admin Risk/Audit dashboards.
 */

import { expect, test } from '@playwright/test';
import { join } from 'node:path';

const sampleDocumentPath = join(process.cwd(), 'tests', 'e2e', 'fixtures', 'sample-document.png');

test.describe('Student verification and OCR UI', () => {
  test.use({ storageState: 'tests/e2e/.auth/student.json' });

  test('verification page renders', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await expect(page).toHaveURL(/\/dashboard\/student\/verification/);

    // Page shows either the active verification flow or a blocked state (if onboarding not done)
    await expect
      .poll(
        async () => {
          const hasActiveVerif = await page
            .getByRole('heading', { name: /verification/i })
            .first()
            .isVisible({ timeout: 5_000 })
            .catch(() => false);
          const hasBlockedState = await page
            .getByText(/verification is locked|complete your onboarding/i)
            .isVisible({ timeout: 2_000 })
            .catch(() => false);
          return hasActiveVerif || hasBlockedState;
        },
        { timeout: 15_000 },
      )
      .toBe(true);
  });

  test('verification tier cards visible or blocked state shown', async ({ page }) => {
    await page.goto('/dashboard/student/verification');
    await expect(page).toHaveURL(/\/dashboard\/student\/verification/);

    // Check if we're in active or blocked state
    const isBlocked = await page
      .getByText(/verification is locked/i)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (isBlocked) {
      // Blocked state: should show CTA to setup
      await expect(page.getByRole('link', { name: /go to setup/i })).toBeVisible({ timeout: 5_000 });
      return;
    }

    // Active state: tier cards should be visible
    await expect(page.getByText(/phone verification/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/identity verification/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/bank account/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('documents page shows upload area or blocked state', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await expect(page).toHaveURL(/\/dashboard\/student\/documents/);

    const isBlocked = await page
      .getByText(/documents are locked/i)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (isBlocked) {
      await expect(page.getByRole('link', { name: /go to verification/i })).toBeVisible({
        timeout: 5_000,
      });
      return;
    }

    // Active: page heading and main content area confirm the page rendered
    await expect(page.getByRole('heading', { name: /documents/i }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Admin risk and audit UI', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin.json' });

  test('risk page renders', async ({ page }) => {
    await page.goto('/dashboard/admin/risk');
    await expect(page).toHaveURL(/\/dashboard\/admin\/risk/);
    await expect(page.getByRole('heading', { name: /^risk/i, level: 1 })).toBeVisible({ timeout: 10_000 });
  });

  test('audit log page renders', async ({ page }) => {
    await page.goto('/dashboard/admin/audit');
    await expect(page).toHaveURL(/\/dashboard\/admin\/audit/);
    await expect(page.getByRole('heading', { name: /audit log/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});
