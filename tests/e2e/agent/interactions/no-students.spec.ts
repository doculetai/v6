/**
 * Layer B — Agent: no students assigned.
 * Students page shows empty state. Commissions page also empty.
 */

import { test, expect } from '@playwright/test';
import { setAgentState } from '../../helpers/db-agent';

const AGENT_ID = process.env.E2E_AGENT_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Agent state: no students', () => {
  test.beforeAll(async () => {
    await setAgentState(AGENT_ID, STUDENT_ID, {
      hasAssignedStudent: false,
      hasPendingCommission: false,
    });
  });

  test('students page shows empty state', async ({ page }) => {
    await page.goto('/dashboard/agent/students');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no students|no.*assigned/i)).toBeVisible({ timeout: 10_000 });
  });

  test('commissions page shows empty state', async ({ page }) => {
    await page.goto('/dashboard/agent/commissions');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no commission|no.*earning/i)).toBeVisible({ timeout: 10_000 });
  });
});
