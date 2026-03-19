/**
 * Layer C — Sponsor brand compliance (computed styles).
 * Role accent: #15803D = rgb(21, 128, 61).
 */

import { test, expect } from '@playwright/test';

test.describe('Sponsor brand compliance (computed styles)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/sponsor');
    await page.waitForLoadState('networkidle');
  });

  test('--accent CSS variable resolves to sponsor accent', async ({ page }) => {
    // --accent is set via [data-role="sponsor"] in globals.css (not on :root)
    const accent = await page.evaluate(() => {
      const el = document.querySelector('[data-role]');
      if (!el) return '';
      return getComputedStyle(el).getPropertyValue('--accent').trim();
    });
    expect(accent.toUpperCase()).toBe('#15803D');
  });

  test('active sidebar item has sponsor role accent border-left', async ({ page }) => {
    const activeLink = page
      .locator('aside[aria-label*="navigation" i] a[aria-current="page"]')
      .first();
    await expect(activeLink).toBeVisible({ timeout: 10_000 });

    const borderColor = await activeLink.evaluate((el) => {
      const target = el.closest('[style*="borderLeft"]') ?? el;
      return getComputedStyle(target).borderLeftColor;
    });
    // Sponsor accent #15803D = rgb(21, 128, 61)
    expect(borderColor).toBe('rgb(21, 128, 61)');
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
