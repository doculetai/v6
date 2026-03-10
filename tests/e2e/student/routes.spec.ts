/**
 * Layer A — Student route coverage.
 * Every student nav item: no login redirect, H1 matches label, main visible.
 */

import { test, expect } from '@playwright/test';
import { studentNavConfig } from '@/config/nav/student';

for (const item of studentNavConfig.items) {
  test(`route: ${item.label} (${item.href})`, async ({ page }) => {
    await page.goto(item.href);

    // No redirect to login
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(new RegExp(item.href.replace(/\//g, '\\/')), {
      timeout: 15_000,
    });

    // H1 matches nav label exactly — CLAUDE.md: "Page headings: H1 matches sidebar nav label exactly"
    await expect(
      page.getByRole('heading', { name: item.label, level: 1 }),
    ).toBeVisible({ timeout: 10_000 });

    // Main content area present
    await expect(page.getByRole('main')).toBeVisible();

    // No error boundary triggered
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });
}
