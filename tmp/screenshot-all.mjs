import { chromium } from '/Users/gm/v6/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Login
await page.goto('http://localhost:3001/login');
await page.waitForTimeout(1000);
await page.fill('#login-email', 'kemi@test.com');
await page.fill('#login-password', 'password123');
await page.click('button[type="submit"]');
await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
await page.waitForTimeout(2000);
console.log('Logged in, URL:', page.url());

// Now capture all student pages
const pages = [
  { url: 'http://localhost:3001/dashboard/student/onboarding', name: 'onboarding' },
  { url: 'http://localhost:3001/dashboard/student/schools', name: 'schools' },
  { url: 'http://localhost:3001/dashboard/student/verify', name: 'verify' },
  { url: 'http://localhost:3001/dashboard/student/documents', name: 'documents' },
  { url: 'http://localhost:3001/dashboard/student/proof', name: 'proof' },
];

for (const { url, name } of pages) {
  await page.goto(url);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `/tmp/v6-${name}.png`, fullPage: true });
  console.log(`${name}: ${page.url()}`);
}

// Also capture mobile view
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:3001/dashboard/student/onboarding');
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/v6-mobile-onboarding.png', fullPage: true });
console.log('Mobile onboarding captured');

await browser.close();
