/**
 * Layer A — University route coverage.
 * Every university nav item: no login redirect, H1 matches label, main visible.
 */

import { test, expect } from '@playwright/test';

const UNIVERSITY_NAV_ITEMS = [
  { label: 'Overview',  href: '/dashboard/university' },
  { label: 'Programs',  href: '/dashboard/university/programs' },
  { label: 'Students',  href: '/dashboard/university/students' },
  { label: 'Settings',  href: '/dashboard/university/settings' },
] as const;

for (const item of UNIVERSITY_NAV_ITEMS) {
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
