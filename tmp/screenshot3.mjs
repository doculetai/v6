import { chromium } from '/Users/gm/v6/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ 
  viewport: { width: 1440, height: 900 }
});
const page = await ctx.newPage();

// First go to the app to get it initialized
await page.goto('http://localhost:3001/login');
await page.waitForTimeout(2000);

// Inject the auth session directly into localStorage via supabase's pattern
const ACCESS_TOKEN = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0NDAxL2F1dGgvdjEiLCJzdWIiOiIyN2E2NmZkZi1hZDczLTQwZWQtYjY1OC05ZGU3MTcwMTYyYTUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcyNjQxMDUwLCJpYXQiOjE3NzI2Mzc0NTAsImVtYWlsIjoia2VtaUB0ZXN0LmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzcyNjM3NDUwfV0sInNlc3Npb25faWQiOiJkYzJlNDNiNC0xNjMxLTRhNzktYWI2Ny1iNWE0ZTNlYzUwMzgiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.Q1Z6Yu7ZXGB-e7uK0YCuA60C4itt_sJ-K995LYSL6G-myPQLipgfDwDpGdb8Ov0RFL0wOA7mKob0-JHvcnv6ww';
const REFRESH_TOKEN = 'tifxwnfekgoy';

const sessionObj = {
  access_token: ACCESS_TOKEN,
  refresh_token: REFRESH_TOKEN,
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now()/1000) + 3600,
  user: { 
    id: '27a66fdf-ad73-40ed-b658-9de7170162a5', 
    email: 'kemi@test.com', 
    role: 'authenticated', 
    aud: 'authenticated',
    email_confirmed_at: '2026-03-04T15:15:35.971032Z',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { email_verified: true }
  }
};

// Set session in localStorage (Supabase SSR still uses server-side cookies, 
// but for browser client we can use the signIn form properly)
await page.fill('#login-email', 'kemi@test.com');
await page.fill('#login-password', 'password123');

// Wait for submit and check for errors
const responsePromise = page.waitForResponse('**/auth/v1/token*');
await page.click('button[type="submit"]');

try {
  const resp = await responsePromise;
  const body = await resp.json();
  console.log('Auth response status:', resp.status());
  if (body.error) console.log('Auth error:', body.error);
  else console.log('Auth success! User:', body.user?.email);
} catch(e) {
  console.log('Response error:', e.message);
}

await page.waitForTimeout(3000);
console.log('After login, URL:', page.url());
await page.screenshot({ path: '/tmp/v6-post-login.png', fullPage: true });

await browser.close();
