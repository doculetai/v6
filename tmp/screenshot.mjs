import { chromium } from '/Users/gm/v6/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Login
await page.goto('http://localhost:3001/login');
await page.screenshot({ path: '/tmp/v6-login.png', fullPage: true });
console.log('Login page captured');

// Try signing in
try {
  await page.fill('input[type="email"]', 'kemi@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ timeout: 8000 }).catch(() => {});
  await page.screenshot({ path: '/tmp/v6-after-login.png', fullPage: true });
  console.log('After login:', page.url());
} catch(e) {
  console.log('Login error:', e.message);
}

// Go to student dashboard
await page.goto('http://localhost:3001/dashboard/student');
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/v6-student-dashboard.png', fullPage: true });
console.log('Student dashboard captured:', page.url());

// Screenshot overview (overview route)
await page.goto('http://localhost:3001/dashboard/student/overview');
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/v6-student-overview.png', fullPage: true });
console.log('Student overview captured');

await browser.close();
