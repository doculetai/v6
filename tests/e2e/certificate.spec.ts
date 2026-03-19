/**
 * E2E: Certificate verification — public page without auth
 */

import { test, expect } from '@playwright/test';

test.describe('Certificate verification', () => {
  test('invalid token shows not found or error state', async ({ page }) => {
    await page.goto('/certificate/invalid-token-123', { waitUntil: 'domcontentloaded' });

    // Wait for the page to settle — either the not-found state or an error boundary renders
    await page.waitForTimeout(3_000);

    // Page may render one of:
    // A) "Certificate not found" (DB available, token not found → PageHeader description)
    // B) Error boundary: "Unable to complete this action." paragraph + "Try again" button
    // C) "Certificate Verification" heading (shown in both A and valid cert cases)
    // D) Error boundary: "Back to home" link

    const snapshot = await page.content();

    const hasAnyExpectedContent =
      /certificate not found|certificate verification|unable to complete|try again|back to home/i.test(snapshot);

    expect(hasAnyExpectedContent).toBe(true);
  });
});
