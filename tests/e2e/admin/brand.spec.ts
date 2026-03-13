/**
 * Layer C — Admin brand compliance (computed styles).
 * Role accent: #C2410C = rgb(194, 65, 12).
 */

import { test, expect } from '@playwright/test';

test.describe('Admin brand compliance (computed styles)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/admin');
    await page.waitForLoadState('networkidle');
  });

  test('--role-accent CSS variable resolves to admin accent', async ({ page }) => {
    const roleAccent = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--role-accent')
        .trim(),
    );
    expect(roleAccent.toUpperCase()).toBe('#C2410C');
  });

  test('active sidebar item has admin role accent border-left', async ({ page }) => {
    const activeLink = page
      .locator('aside[aria-label*="navigation" i] a[aria-current="page"]')
      .first();
    await expect(activeLink).toBeVisible({ timeout: 10_000 });

    const borderColor = await activeLink.evaluate((el) => {
      const target = el.closest('[style*="borderLeft"]') ?? el;
      return getComputedStyle(target).borderLeftColor;
    });
    // Admin accent #C2410C = rgb(194, 65, 12)
    expect(borderColor).toBe('rgb(194, 65, 12)');
  });

  test('body font-family is IBM Plex Sans', async ({ page }) => {
    const fontFamily = await page.evaluate(() =>
      getComputedStyle(document.body).fontFamily,
    );
    expect(fontFamily.toLowerCase()).toContain('ibm plex sans');
  });

  test('amount elements use IBM Plex Mono font', async ({ page }) => {
    const monoEl = page.locator('.font-mono, [data-testid="amount"]').first();
    const count = await monoEl.count();
    test.skip(count === 0, 'No amount elements on this page');
    if (count === 0) return;
    const fontFamily = await monoEl.evaluate((el) =>
      getComputedStyle(el).fontFamily,
    );
    expect(fontFamily.toLowerCase()).toContain('ibm plex mono');
  });
});
