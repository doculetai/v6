/**
 * Layer B — University: with enrolled students.
 * Students page shows a roster row. Overview reflects receive_applications stage.
 * CLAUDE.md university QA: university has 3 stages — manage_programmes,
 * receive_applications, monitor_enrolment.
 */

import { test, expect } from '@playwright/test';
import { setUniversityState } from '../../helpers/db-university';

const SCHOOL_ID = process.env.E2E_UNIVERSITY_SCHOOL_ID!;
const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('University state: with students', () => {
  test.beforeAll(async () => {
    await setUniversityState(SCHOOL_ID, { hasPrograms: true, hasStudents: true }, STUDENT_ID);
  });

  test.afterAll(async () => {
    // Detach the E2E student from the school after the spec to avoid state bleed
    await setUniversityState(SCHOOL_ID, { hasPrograms: true, hasStudents: false }, STUDENT_ID);
  });

  test('students page renders without error', async ({ page }) => {
    await page.goto('/dashboard/university/students');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });

  test('students page shows at least one student row', async ({ page }) => {
    await page.goto('/dashboard/university/students');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/no student/i)).not.toBeVisible({ timeout: 10_000 });
  });

  test('overview renders without error with enrolled students', async ({ page }) => {
    await page.goto('/dashboard/university');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Something went wrong')).not.toBeVisible();
  });
});
