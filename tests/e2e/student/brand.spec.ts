/**
 * Layer C — Student brand compliance (browser computed styles).
 * Role accent, font families, CSS variable resolution.
 */

import { test, expect } from '@playwright/test';

test.describe('Student brand compliance (computed styles)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/student');
    await page.waitForLoadState('networkidle');
  });

  test('active sidebar item has student role accent border-left', async ({ page }) => {
    // CLAUDE.md sidebar: active = borderLeft 3px solid var(--role-accent)
    const activeLink = page
      .locator('aside[aria-label*="navigation" i] a[aria-current="page"]')
      .first();
    await expect(activeLink).toBeVisible({ timeout: 10_000 });

    const borderColor = await activeLink.evaluate((el) => {
      const target = el.closest('[style*="borderLeft"]') ?? el;
      return getComputedStyle(target).borderLeftColor;
    });
    // Student accent #2B39A3 = rgb(43, 57, 163)
    expect(borderColor).toBe('rgb(43, 57, 163)');
  });

  test('body font-family is IBM Plex Sans', async ({ page }) => {
    const fontFamily = await page.evaluate(() =>
      getComputedStyle(document.body).fontFamily,
    );
    expect(fontFamily.toLowerCase()).toContain('ibm plex sans');
  });

  test('--accent CSS variable resolves to student accent', async ({ page }) => {
    // --accent is set via [data-role="student"] in globals.css (not on :root)
    const accent = await page.evaluate(() => {
      const el = document.querySelector('[data-role]');
      if (!el) return '';
      return getComputedStyle(el).getPropertyValue('--accent').trim();
    });
    expect(accent.toUpperCase()).toBe('#2B39A3');
  });

  test('amount elements use IBM Plex Mono font', async ({ page }) => {
    const monoEl = page.locator('.font-mono, [data-testid="amount"]').first();
    const count = await monoEl.count();
    test.skip(count === 0, 'No amount elements on this journey state');
    if (count === 0) return;
    const fontFamily = await monoEl.evaluate((el) =>
      getComputedStyle(el).fontFamily,
    );
    expect(fontFamily.toLowerCase()).toContain('ibm plex mono');
  });
});
