/**
 * Layer A — Agent route coverage.
 * Every agent nav item: no login redirect, H1 matches label, main visible.
 * CLAUDE.md: Agent nav — 5 items: Overview, Students, Activity, Commissions, Settings.
 */

import { test, expect } from '@playwright/test';

const AGENT_NAV_ITEMS = [
  { label: 'Overview',    href: '/dashboard/agent' },
  { label: 'Students',    href: '/dashboard/agent/students' },
  { label: 'Activity',    href: '/dashboard/agent/activity' },
  { label: 'Commissions', href: '/dashboard/agent/commissions' },
  { label: 'Settings',    href: '/dashboard/agent/settings' },
] as const;

for (const item of AGENT_NAV_ITEMS) {
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
