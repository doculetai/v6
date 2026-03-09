import { config } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

config({ path: '.env.local' });
config({ path: '.env' });

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 60_000,
  },
  projects: [
    /** Unauthenticated specs — no E2E env required. Run: npx playwright test --project=unauthenticated */
    {
      name: 'unauthenticated',
      testMatch: /auth\.spec\.ts|certificate\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    { name: 'setup', testMatch: /.*\.setup\.ts/, timeout: 90_000 },
    {
      name: 'chromium',
      testMatch: /student-dashboard\.spec\.ts|documents\.spec\.ts|disbursement\.spec\.ts|verification-ocr-fraud\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/student.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'university',
      testMatch: /university-doc-review\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
  outputDir: 'tests/e2e/test-results',
});
