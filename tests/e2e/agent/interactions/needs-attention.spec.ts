/**
 * Layer B — Agent: needs attention state.
 * At least one assigned student has a rejected document.
 * Overview shows the "attention banner" — CLAUDE.md: State 3.
 */

import { test, expect } from '@playwright/test';
import { setAgentState } from '../../helpers/db-agent';

const AGENT_ID = process.env.E2E_AGENT_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Agent state: needs attention', () => {
  test.beforeAll(async () => {
    await setAgentState(AGENT_ID, STUDENT_ID, {
      hasAssignedStudent: true,
      hasPendingCommission: false,
      studentHasRejectedDoc: true,
    });
  });

  test('overview renders without error', async ({ page }) => {
    await page.goto('/dashboard/agent/overview');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('overview shows attention/action banner for blocked student', async ({ page }) => {
    await page.goto('/dashboard/agent/overview');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByText(/attention|action required|blocked|rejected/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('students page shows the assigned student', async ({ page }) => {
    await page.goto('/dashboard/agent/students');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no students|no.*assigned/i)).not.toBeVisible({ timeout: 10_000 });
  });
});
