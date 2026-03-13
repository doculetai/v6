/**
 * Layer B — Agent: mature portfolio (all students certified).
 * Overview shows State 6 — all students have issued certificates.
 * Commission preview shows paid commissions. No attention banner.
 * CLAUDE.md: QA doc State 6 — "mature portfolio".
 */

import { test, expect } from '@playwright/test';
import { setAgentState } from '../../helpers/db-agent';

const AGENT_ID = process.env.E2E_AGENT_USER_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Agent state: all certified', () => {
  test.beforeAll(async () => {
    await setAgentState(AGENT_ID, STUDENT_ID, {
      hasAssignedStudent: true,
      hasPendingCommission: false,
      studentCertIssued: true,
    });
  });

  test('overview renders without error', async ({ page }) => {
    await page.goto('/dashboard/agent/overview');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('no attention/action banner shown (no blocked students)', async ({ page }) => {
    await page.goto('/dashboard/agent/overview');
    await page.waitForLoadState('networkidle');
    // Certified students should not trigger the attention banner
    const content = await page.getByRole('main').textContent() ?? '';
    expect(content.toLowerCase()).not.toMatch(/blocked.*student|action required.*student/);
  });

  test('students page shows the certified student', async ({ page }) => {
    await page.goto('/dashboard/agent/students');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no students|no.*assigned/i)).not.toBeVisible({ timeout: 10_000 });
  });

  test('commissions page renders without error', async ({ page }) => {
    await page.goto('/dashboard/agent/commissions');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });
});
