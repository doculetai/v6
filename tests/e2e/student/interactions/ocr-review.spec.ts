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

  test('documents page shows "Review required" chip for OCR pending doc', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await page.waitForLoadState('networkidle');
    // OCR review chip is the trigger (CLAUDE.md: "OCR review card inline below uploaded file")
    await expect(page.getByText('Review required')).toBeVisible({ timeout: 10_000 });
  });

  test('clicking "Review required" chip opens the OCR review sheet', async ({ page }) => {
    await page.goto('/dashboard/student/documents');
    await page.waitForLoadState('networkidle');
    await page.getByText('Review required').click();
    // OcrReviewSheet has title "Review statement details"
    await expect(page.getByText('Review statement details')).toBeVisible({ timeout: 10_000 });
  });
});
