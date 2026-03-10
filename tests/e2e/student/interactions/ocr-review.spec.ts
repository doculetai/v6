import { test, expect } from '@playwright/test';
import { setStudentState } from '../../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

test.describe.serial('Journey state: OCR review', () => {
  test.beforeAll(async () => {
    await setStudentState(STUDENT_ID, {
      t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: false,
      onboardingComplete: true, documentStatus: 'pending', ocrReviewPending: true,
      certificateIssued: false,
    });
  });

  test('OCR review card with 4 editable fields + confirm CTA', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await page.waitForLoadState('networkidle');
    // OCR card visible inline (CLAUDE.md: "OCR review card inline below uploaded file")
    await expect(page.locator('[data-ocr-review-field]')).toHaveCount(4, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: /confirm and submit/i })).toBeVisible();
  });
});
