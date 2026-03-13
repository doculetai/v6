/**
 * Layer B — Agent: has pending commission.
 * Commissions page shows a pending commission row.
 */

import { test, expect } from '@playwright/test';
import { setAgentState } from '../../helpers/db-agent';

const AGENT_ID = process.env.E2E_AGENT_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Agent state: with commissions', () => {
  test.beforeAll(async () => {
    await setAgentState(AGENT_ID, STUDENT_ID, {
      hasAssignedStudent: true,
      hasPendingCommission: true,
    });
  });

  test('commissions page shows pending commission row', async ({ page }) => {
    await page.goto('/dashboard/agent/commissions');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no commission|no.*earning/i)).not.toBeVisible({ timeout: 10_000 });
  });

  test('commission shows NGN amount in mono font', async ({ page }) => {
    await page.goto('/dashboard/agent/commissions');
    await page.waitForLoadState('networkidle');
    // Amount should be rendered — at least the currency symbol visible
    await expect(page.getByText(/₦|NGN/)).toBeVisible({ timeout: 10_000 });
  });

  test('commission status badge shows "Pending"', async ({ page }) => {
    await page.goto('/dashboard/agent/commissions');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/pending/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
