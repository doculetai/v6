/**
 * Layer A — Partner route coverage.
 * Every partner nav item: no login redirect, H1 matches label, main visible.
 */

import { test, expect } from '@playwright/test';

const PARTNER_NAV_ITEMS = [
  { label: 'Overview',  href: '/dashboard/partner' },
  { label: 'API Keys',  href: '/dashboard/partner/api-keys' },
  { label: 'Students',  href: '/dashboard/partner/students' },
  { label: 'Analytics', href: '/dashboard/partner/analytics' },
  { label: 'Branding',  href: '/dashboard/partner/branding' },
  { label: 'Settings',  href: '/dashboard/partner/settings' },
] as const;

for (const item of PARTNER_NAV_ITEMS) {
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
