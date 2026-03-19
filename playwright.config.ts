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
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  snapshotPathTemplate: 'tests/e2e/{testFileDir}/__screenshots__/{arg}{ext}',
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
      testMatch: /student-dashboard\.spec\.ts|documents\.spec\.ts|verification-ocr-fraud\.spec\.ts|student\/routes\.spec\.ts|student\/brand\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/student.json',
      },
      dependencies: ['setup'],
    },
    /** Multi-role specs — each describe block declares its own storageState */
    {
      name: 'multi-role',
      testMatch: /disbursement\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'university',
      testMatch: /university-doc-review\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/university.json' },
      dependencies: ['setup'],
    },
    {
      name: 'student-interactions',
      testMatch: /student\/interactions\/.+\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/student.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'visual',
      testMatch: /student\/visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        storageState: 'tests/e2e/.auth/student.json',
      },
      dependencies: ['setup'],
    },
    // ─── Admin ───────────────────────────────────────────────────────────────
    {
      name: 'admin-routes',
      testMatch: /admin\/routes\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/admin.json' },
      dependencies: ['setup'],
    },
    {
      name: 'admin-brand',
      testMatch: /admin\/brand\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/admin.json' },
      dependencies: ['setup'],
    },
    {
      name: 'admin-interactions',
      testMatch: /admin\/interactions\/.+\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/admin.json' },
      dependencies: ['setup'],
    },
    {
      name: 'admin-visual',
      testMatch: /admin\/visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, storageState: 'tests/e2e/.auth/admin.json' },
      dependencies: ['setup'],
    },
    // ─── Agent ───────────────────────────────────────────────────────────────
    {
      name: 'agent-routes',
      testMatch: /agent\/routes\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/agent.json' },
      dependencies: ['setup'],
    },
    {
      name: 'agent-brand',
      testMatch: /agent\/brand\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/agent.json' },
      dependencies: ['setup'],
    },
    {
      name: 'agent-interactions',
      testMatch: /agent\/interactions\/.+\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/agent.json' },
      dependencies: ['setup'],
    },
    {
      name: 'agent-visual',
      testMatch: /agent\/visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, storageState: 'tests/e2e/.auth/agent.json' },
      dependencies: ['setup'],
    },
    // ─── Sponsor ─────────────────────────────────────────────────────────────
    {
      name: 'sponsor-routes',
      testMatch: /sponsor\/routes\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/sponsor.json' },
      dependencies: ['setup'],
    },
    {
      name: 'sponsor-brand',
      testMatch: /sponsor\/brand\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/sponsor.json' },
      dependencies: ['setup'],
    },
    {
      name: 'sponsor-interactions',
      testMatch: /sponsor\/interactions\/.+\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/sponsor.json' },
      dependencies: ['setup'],
    },
    {
      name: 'sponsor-visual',
      testMatch: /sponsor\/visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, storageState: 'tests/e2e/.auth/sponsor.json' },
      dependencies: ['setup'],
    },
    // ─── University ──────────────────────────────────────────────────────────
    {
      name: 'university-routes',
      testMatch: /university\/routes\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/university.json' },
      dependencies: ['setup'],
    },
    {
      name: 'university-brand',
      testMatch: /university\/brand\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/university.json' },
      dependencies: ['setup'],
    },
    {
      name: 'university-interactions',
      testMatch: /university\/interactions\/.+\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/university.json' },
      dependencies: ['setup'],
    },
    {
      name: 'university-visual',
      testMatch: /university\/visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, storageState: 'tests/e2e/.auth/university.json' },
      dependencies: ['setup'],
    },
    // ─── Partner ─────────────────────────────────────────────────────────────
    {
      name: 'partner-routes',
      testMatch: /partner\/routes\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/partner.json' },
      dependencies: ['setup'],
    },
    {
      name: 'partner-brand',
      testMatch: /partner\/brand\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/partner.json' },
      dependencies: ['setup'],
    },
    {
      name: 'partner-interactions',
      testMatch: /partner\/interactions\/.+\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/partner.json' },
      dependencies: ['setup'],
    },
    {
      name: 'partner-visual',
      testMatch: /partner\/visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, storageState: 'tests/e2e/.auth/partner.json' },
      dependencies: ['setup'],
    },
  ],
  outputDir: 'tests/e2e/test-results',
});
