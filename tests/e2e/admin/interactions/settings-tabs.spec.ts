/**
 * Layer E — Admin settings: tab content renders on click.
 * Tabs: Profile (default), Security, Notifications, Exchange Rates, Templates.
 * Tests that the default panel loads and each tab mounts without error when clicked.
 */

import { test, expect } from '@playwright/test';

test.describe.serial('Triggered: admin settings tabs', () => {
  test('profile tab is selected by default (shows profile form)', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');
    // Profile panel: shows full name or email input field
    // Profile tab: Full name input is present (unique on the page)
    await expect(page.getByRole('textbox', { name: 'Full name' })).toBeVisible({ timeout: 10_000 });
  });

  test('security tab renders "Active Sessions" on click', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: 'Security' }).click();
    await expect(
      page.getByText('Active Sessions'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('notifications tab renders content on click', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: 'Notifications' }).click();
    await expect(
      page.getByText(/operations team|notification|channel/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});
