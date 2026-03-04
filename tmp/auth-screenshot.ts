import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3001/login');
  await page.fill('input[type="email"]', 'kemi@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard/**', { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  await page.screenshot({ path: '/tmp/v6-home-auth.png', fullPage: false });
  console.log('Done');
  await browser.close();
})();
