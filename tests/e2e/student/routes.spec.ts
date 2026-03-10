/**
 * Layer A — Student route coverage.
 * Every student nav item: no login redirect, H1 matches label, main visible.
 */

import { test, expect } from '@playwright/test';

// CLAUDE.md: Student sidebar nav (6 items): Overview → Onboarding → Verification
//             → Documents → Proof of Funds → Settings
const STUDENT_NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/student' },
  { label: 'Onboarding', href: '/dashboard/student/setup' },
  { label: 'Verification', href: '/dashboard/student/verification' },
  { label: 'Documents', href: '/dashboard/student/documents' },
  { label: 'Proof of Funds', href: '/dashboard/student/proof' },
  { label: 'Settings', href: '/dashboard/student/settings' },
] as const;

for (const item of STUDENT_NAV_ITEMS) {
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
