/**
 * Layer D — Student visual regression.
 * Pixel-diff baselines. maxDiffPixels: 0 (set in playwright.config.ts).
 * To update: npm run test:e2e:update-snapshots
 */

import { test, expect } from '@playwright/test';
import { setStudentState } from '../helpers/db';
import type { StudentJourneyState } from '../helpers/db';

const STUDENT_ID = process.env.E2E_STUDENT_USER_ID!;

const DYNAMIC = (page: import('@playwright/test').Page) => ({
  mask: ['time', '[data-testid="timestamp"]', '[data-testid="relative-date"]',
    '[data-testid="notification-count"]'].map((s) => page.locator(s)),
});

async function prep(page: import('@playwright/test').Page, state: StudentJourneyState, path: string) {
  await setStudentState(STUDENT_ID, state);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // font settle
}

const S = {
  fresh: {
    t1PhoneVerified: false, t2KycVerified: false, t3BankVerified: false,
    onboardingComplete: false, documentStatus: 'none', certificateIssued: false,
  } satisfies StudentJourneyState,
  onboardingDone: {
    t1PhoneVerified: false, t2KycVerified: false, t3BankVerified: false,
    onboardingComplete: true, documentStatus: 'none', certificateIssued: false,
  } satisfies StudentJourneyState,
  allComplete: {
    t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: true,
    onboardingComplete: true, documentStatus: 'approved', certificateIssued: true,
  } satisfies StudentJourneyState,
  t2Done: {
    t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: false,
    onboardingComplete: true, documentStatus: 'none', certificateIssued: false,
  } satisfies StudentJourneyState,
};

test('overview — first session', async ({ page }) => {
  await prep(page, S.fresh, '/dashboard/student');
  await expect(page).toHaveScreenshot('overview-first-session.png', DYNAMIC(page));
});

test('overview — onboarding complete', async ({ page }) => {
  await prep(page, S.onboardingDone, '/dashboard/student');
  await expect(page).toHaveScreenshot('overview-onboarding-complete.png', DYNAMIC(page));
});

test('overview — proof ready', async ({ page }) => {
  await prep(page, S.allComplete, '/dashboard/student');
  await expect(page).toHaveScreenshot('overview-proof-ready.png', DYNAMIC(page));
});

test('verification — T2 complete', async ({ page }) => {
  await prep(page, S.t2Done, '/dashboard/student/verification');
  await expect(page).toHaveScreenshot('verification-t2-complete.png', DYNAMIC(page));
});

test('documents — OCR review', async ({ page }) => {
  await prep(page, {
    t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: false,
    onboardingComplete: true, documentStatus: 'pending', ocrReviewPending: true, certificateIssued: false,
  }, '/dashboard/student/documents');
  await expect(page).toHaveScreenshot('documents-ocr-review.png', DYNAMIC(page));
});

test('documents — rejected', async ({ page }) => {
  await prep(page, {
    t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: false,
    onboardingComplete: true,
    documentStatus: 'rejected',
    rejectionReason: 'Balance below required minimum. Resubmit with correct statement.',
    certificateIssued: false,
  }, '/dashboard/student/documents');
  await expect(page).toHaveScreenshot('documents-rejected.png', DYNAMIC(page));
});

test('proof — under final review', async ({ page }) => {
  await prep(page, {
    t1PhoneVerified: true, t2KycVerified: true, t3BankVerified: true,
    onboardingComplete: true, documentStatus: 'approved', certificateIssued: false,
  }, '/dashboard/student/proof');
  await expect(page).toHaveScreenshot('proof-under-final-review.png', DYNAMIC(page));
});

test('proof — cert ready', async ({ page }) => {
  await prep(page, S.allComplete, '/dashboard/student/proof');
  await expect(page).toHaveScreenshot('proof-cert-ready.png', DYNAMIC(page));
});
