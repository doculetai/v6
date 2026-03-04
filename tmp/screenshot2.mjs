import { chromium } from '/Users/gm/v6/node_modules/playwright/index.mjs';

const ACCESS_TOKEN = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0NDAxL2F1dGgvdjEiLCJzdWIiOiIyN2E2NmZkZi1hZDczLTQwZWQtYjY1OC05ZGU3MTcwMTYyYTUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcyNjQxMDUwLCJpYXQiOjE3NzI2Mzc0NTAsImVtYWlsIjoia2VtaUB0ZXN0LmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzcyNjM3NDUwfV0sInNlc3Npb25faWQiOiJkYzJlNDNiNC0xNjMxLTRhNzktYWI2Ny1iNWE0ZTNlYzUwMzgiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.Q1Z6Yu7ZXGB-e7uK0YCuA60C4itt_sJ-K995LYSL6G-myPQLipgfDwDpGdb8Ov0RFL0wOA7mKob0-JHvcnv6ww';
const REFRESH_TOKEN = 'tifxwnfekgoy';
const PROJECT_REF = 'v6'; // local project

const authPayload = JSON.stringify({
  access_token: ACCESS_TOKEN,
  refresh_token: REFRESH_TOKEN,
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now()/1000) + 3600,
  user: { id: '27a66fdf-ad73-40ed-b658-9de7170162a5', email: 'kemi@test.com', role: 'authenticated', aud: 'authenticated' }
});

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ 
  viewport: { width: 1440, height: 900 },
  storageState: {
    cookies: [
      { name: `sb-127-auth-token`, value: authPayload, domain: '127.0.0.1', path: '/' },
      { name: `sb-127-auth-token.0`, value: authPayload, domain: '127.0.0.1', path: '/' }
    ],
    origins: []
  }
});

const page = await ctx.newPage();

const pages = [
  { url: 'http://localhost:3001/dashboard/student', name: 'dashboard' },
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

await browser.close();
