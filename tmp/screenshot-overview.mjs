import { chromium } from '/Users/gm/v6/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto('http://localhost:3001/login');
await page.waitForTimeout(1000);
await page.fill('#login-email', 'kemi@test.com');
await page.fill('#login-password', 'password123');
await page.click('button[type="submit"]');
await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
await page.waitForTimeout(2000);

// Get overview
await page.goto('http://localhost:3001/dashboard/student/overview');
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/v6-overview.png', fullPage: true });
console.log('Overview:', page.url());

// Schools after fix
await page.goto('http://localhost:3001/dashboard/student/schools');
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/v6-schools2.png', fullPage: true });
console.log('Schools:', page.url());

await browser.close();
