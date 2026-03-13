/**
 * Layer E — Admin settings: tab content renders on click.
 * Tabs: Security (default), Notifications, Team.
 * Tests that each tab panel mounts without error when selected.
 */

import { test, expect } from '@playwright/test';

test.describe.serial('Triggered: admin settings tabs', () => {
  test('security tab is selected by default (no click needed)', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');
    // SessionManagementWithData renders "Active Sessions" heading in the security panel
    await expect(page.getByText('Active Sessions')).toBeVisible({ timeout: 10_000 });
  });

  test('notifications tab renders content on click', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: 'Notifications' }).click();
    // Notifications panel shows a coming-soon message
    await expect(
      page.getByText(/operations team|notification|channel/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('team tab renders "Team members" heading on click', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: 'Team' }).click();
    await expect(page.getByText('Team members')).toBeVisible({ timeout: 10_000 });
  });

  test('team tab renders "Invite admin" button', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: 'Team' }).click();
    await expect(
      page.getByRole('button', { name: 'Invite admin' }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
