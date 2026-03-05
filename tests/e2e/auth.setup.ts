/**
 * E2E auth setup — seeds DB, logs in as test student, saves storageState.
 * Runs before E2E tests via project dependency.
 *
 * Prereq: E2E_STUDENT_EMAIL, E2E_STUDENT_PASSWORD in .env.local
 * Or run: npm run db:seed:e2e (then E2E_SEED_ON_SETUP=false to skip seed in setup)
 */

import { test as setup, expect } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { e2ePersonas, e2eConfig } from './fixtures/e2e-personas';

const authDir = join(process.cwd(), 'tests', 'e2e', '.auth');
const authFile = join(authDir, 'student.json');

setup('seed E2E data', async () => {
  if (e2eConfig.seedOnSetup) {
    const { spawn } = await import('node:child_process');
    await new Promise<void>((resolve, reject) => {
      const child = spawn('npx', ['tsx', 'scripts/seed-e2e.ts'], {
        stdio: 'inherit',
        env: process.env,
        cwd: process.cwd(),
      });
      child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`seed exited ${code}`))));
      child.on('error', reject);
    });
  }
});

setup('authenticate as student', async ({ page }) => {
  if (!existsSync(authDir)) {
    mkdirSync(authDir, { recursive: true });
  }

  await page.goto(`${e2eConfig.baseUrl}/login`);
  await page.getByLabel(/email/i).fill(e2ePersonas.student.email);
  await page.getByLabel(/password/i).fill(e2ePersonas.student.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/(dashboard|auth\/complete)/, { timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
