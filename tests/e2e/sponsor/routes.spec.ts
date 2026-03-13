/**
 * Layer A — Sponsor route coverage.
 * Every sponsor nav item: no login redirect, H1 matches label, main visible.
 */

import { test, expect } from '@playwright/test';

const SPONSOR_NAV_ITEMS = [
  { label: 'Overview',    href: '/dashboard/sponsor' },
  { label: 'Students',    href: '/dashboard/sponsor/students' },
  { label: 'Commitments', href: '/dashboard/sponsor/commitments' },
  { label: 'Payments',    href: '/dashboard/sponsor/transactions' },
  { label: 'Settings',    href: '/dashboard/sponsor/settings' },
] as const;

for (const item of SPONSOR_NAV_ITEMS) {
  test(`route: ${item.label} (${item.href})`, async ({ page }) => {
    await page.goto(item.href);

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(new RegExp(item.href.replace(/\//g, '\\/')), {
      timeout: 15_000,
    });

    await expect(
      page.getByRole('heading', { name: item.label, level: 1 }),
    ).toBeVisible({ timeout: 10_000 });

    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });
}
