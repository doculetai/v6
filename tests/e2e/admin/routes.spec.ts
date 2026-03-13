/**
 * Layer A — Admin route coverage.
 * Every admin nav item: no login redirect, H1 matches label, main visible.
 * CLAUDE.md: Admin nav — 6 items.
 */

import { test, expect } from '@playwright/test';

const ADMIN_NAV_ITEMS = [
  { label: 'Overview',    href: '/dashboard/admin' },
  { label: 'Operations',  href: '/dashboard/admin/operations' },
  { label: 'Analytics',   href: '/dashboard/admin/analytics' },
  { label: 'Risk',        href: '/dashboard/admin/risk' },
  { label: 'Users',       href: '/dashboard/admin/users' },
  { label: 'Settings',    href: '/dashboard/admin/settings' },
] as const;

for (const item of ADMIN_NAV_ITEMS) {
  test(`route: ${item.label} (${item.href})`, async ({ page }) => {
    await page.goto(item.href);

    // No redirect to login
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(new RegExp(item.href.replace(/\//g, '\\/')), {
      timeout: 15_000,
    });

    // H1 matches nav label exactly
    await expect(
      page.getByRole('heading', { name: item.label, level: 1 }),
    ).toBeVisible({ timeout: 10_000 });

    // Main content area present
    await expect(page.getByRole('main')).toBeVisible();

    // No error boundary triggered
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });
}
