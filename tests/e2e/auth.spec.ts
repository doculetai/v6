/**
 * E2E: Auth — login page, redirects
 */

import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome back/i }).first()).toBeVisible();
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('invalid@test.com');
    await page.locator('#login-password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid|incorrect|error/i)).toBeVisible({
      timeout: 5000,
    });
  });
});
