/**
 * E2E: Student dashboard — uses seeded student with onboarding complete.
 */

import { test, expect } from '@playwright/test';

test.describe('Student dashboard', () => {
  test('shows student home after login', async ({ page }) => {
    await page.goto('/dashboard/student');
    await expect(page).toHaveURL(/\/dashboard\/student/);
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('sidebar has student nav items', async ({ page }) => {
    await page.goto('/dashboard/student');
    // Sidebar uses <aside aria-label="Dashboard navigation"> wrapping an inner <nav>
    const sidebar = page.locator('aside[aria-label*="navigation" i]');
    await expect(sidebar).toBeVisible({ timeout: 10_000 });

    await expect(sidebar.getByRole('link', { name: /^overview$/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /^verification$/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /^documents$/i })).toBeVisible();
  });

  test('overview renders main content', async ({ page }) => {
    await page.goto('/dashboard/student');

    // Overview always shows "Overview" heading and either stat cards or journey steps
    await expect(page.getByRole('heading', { name: /overview/i }).first()).toBeVisible({
      timeout: 10_000,
    });

    // The overview renders one of: journey steps, stat cards, or a CTA — all live in main
    await expect(page.getByRole('main')).toBeVisible({ timeout: 5_000 });

    // At least one journey step link (Overview, Onboarding, Verification, etc.) should exist
    const journeyLinks = page.locator('[role="list"] a');
    await expect(journeyLinks.first()).toBeVisible({ timeout: 10_000 });
  });
});
