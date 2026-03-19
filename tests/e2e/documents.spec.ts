/**
 * E2E: Student documents page — document upload flow via UI.
 * The documents page shows either:
 * - Active state (KYC complete): upload area + submitted document list
 * - Blocked state (KYC not done): "Documents are locked" + CTA to verification
 *
 * Prereqs: E2E_STUDENT_EMAIL, E2E_STUDENT_PASSWORD in .env.local
 * Run: npx playwright test documents.spec.ts
 */

import { test, expect } from '@playwright/test';
import { join } from 'node:path';

const sampleDocumentPath = join(process.cwd(), 'tests', 'e2e', 'fixtures', 'sample-document.png');

test.describe('Student documents page', () => {
  test.use({ storageState: 'tests/e2e/.auth/student.json' });

  test('documents page loads and shows heading', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await expect(page).toHaveURL(/\/dashboard\/student\/documents/, { timeout: 15_000 });

    await expect(page.getByRole('heading', { name: /documents/i }).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('shows upload area or blocked state', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await expect(page).toHaveURL(/\/dashboard\/student\/documents/);

    await expect
      .poll(
        async () => {
          // Active state: upload area with "Upload document" button
          const hasUploadButton = await page
            .getByRole('button', { name: /upload document/i })
            .isVisible({ timeout: 2_000 })
            .catch(() => false);
          // Active state: bank statement upload section heading
          const hasUploadSection = await page
            .getByText(/upload your bank statement/i)
            .isVisible({ timeout: 2_000 })
            .catch(() => false);
          // Blocked state
          const hasBlockedState = await page
            .getByText(/documents are locked|complete your identity verification/i)
            .isVisible({ timeout: 2_000 })
            .catch(() => false);
          return hasUploadButton || hasUploadSection || hasBlockedState;
        },
        { timeout: 15_000 },
      )
      .toBe(true);
  });

  test('file upload section is accessible or blocked state shown', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await expect(page).toHaveURL(/\/dashboard\/student\/documents/);

    // Check which state the page is in
    const isBlocked = await page
      .getByText(/documents are locked/i)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (isBlocked) {
      // Blocked state: verify correct CTA is shown
      await expect(page.getByRole('link', { name: /go to verification/i })).toBeVisible({
        timeout: 5_000,
      });
      return;
    }

    // Active state: file upload area should be present
    const hasFileInput = await page
      .getByRole('button', { name: /document file|drag and drop|browse/i })
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    const hasUploadBtn = await page
      .getByRole('button', { name: /upload document/i })
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    expect(hasFileInput || hasUploadBtn).toBe(true);

    // Perform upload if fixture file exists
    const fileInput = page.getByRole('button', { name: /document file|drag and drop/i });
    const isFileInputVisible = await fileInput.isVisible({ timeout: 3_000 }).catch(() => false);
    if (isFileInputVisible) {
      await page.locator('input[type="file"]').setInputFiles(sampleDocumentPath);
      await page.getByRole('button', { name: /upload document/i }).click();

      await expect(page.getByText(/submitted|under review|uploaded|success|uploading/i).first()).toBeVisible({
        timeout: 15_000,
      });
    }
  });
});
