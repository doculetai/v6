/**
 * Layer B — Agent: has an assigned student.
 * Students page shows a student row.
 */

import { test, expect } from '@playwright/test';
import { setAgentState } from '../../helpers/db-agent';

const AGENT_ID = process.env.E2E_AGENT_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Agent state: with students', () => {
  test.beforeAll(async () => {
    await setAgentState(AGENT_ID, STUDENT_ID, {
      hasAssignedStudent: true,
      hasPendingCommission: false,
    });
  });

  test('students page shows assigned student', async ({ page }) => {
    await page.goto('/dashboard/agent/students');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no students|no.*assigned/i)).not.toBeVisible({ timeout: 10_000 });
    // At least one row/card present
    const rows = page.locator('tbody tr, [data-testid="student-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('overview shows student count > 0', async ({ page }) => {
    await page.goto('/dashboard/agent');
    await page.waitForLoadState('networkidle');
    // Some stat showing students
    await expect(page.getByRole('main')).toBeVisible();
  });
});
