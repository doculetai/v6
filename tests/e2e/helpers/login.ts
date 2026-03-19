/**
 * E2E login helper — reusable across Playwright tests.
 * Use for ad-hoc login in specs or debugging.
 *
 * Prereq: Run `npm run db:seed:e2e` so test users exist.
 * Credentials: E2E_STUDENT_EMAIL, E2E_STUDENT_PASSWORD (and sponsor/university when needed).
 */

import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { config } from 'dotenv';
import { e2ePersonas, e2eConfig } from '../fixtures/e2e-personas';

config({ path: '.env.local' });
config({ path: '.env' });

export type LoginPersona = 'student' | 'sponsor' | 'university' | 'admin';

/**
 * Log in at /login and wait for redirect to dashboard.
 * Use when a test needs to authenticate mid-flow (e.g. after visiting a public page).
 */
export async function loginAs(page: Page, persona: LoginPersona): Promise<void> {
  const credentials = persona === 'student'
    ? e2ePersonas.student
    : persona === 'sponsor'
      ? e2ePersonas.sponsor
      : persona === 'university'
        ? e2ePersonas.university
        : e2ePersonas.admin;

  await page.goto(`${e2eConfig.baseUrl}/login`);

  // If already authenticated, /login can redirect to dashboard.
  if (/\/dashboard/.test(page.url())) {
    return;
  }

  await expect(page.getByLabel(/email/i)).toBeVisible();
  await page.waitForTimeout(400);
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.locator('#login-password').fill(credentials.password);
  await page.locator('form button[type="submit"]').first().click();

  await expect(page).toHaveURL(/\/(dashboard|auth\/complete)/, { timeout: 15_000 });
}
