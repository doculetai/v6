# E2E Tests with Seeded Data

Playwright E2E tests run against seeded data. The setup project seeds the DB and authenticates before tests.

## Prerequisites

1. **Env vars** (in `.env.local`):

   ```
   E2E_STUDENT_EMAIL=e2e-student@test.doculet.ai
   E2E_STUDENT_PASSWORD=your-secure-password
   # Optional — for disbursement.spec.ts
   E2E_SPONSOR_EMAIL=e2e-sponsor@test.doculet.ai
   E2E_SPONSOR_PASSWORD=your-secure-password
   ```

2. **App running** at `http://localhost:3000` (or set `PLAYWRIGHT_BASE_URL`).

## Local Supabase

For E2E against local Supabase (Auth, Storage, Realtime):

1. Follow [docs/supabase-local-setup.md](../../docs/supabase-local-setup.md) to start Supabase and load env.
2. Ensure `.env.local` includes (from `npm run supabase:env`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `SUPABASE_DOCUMENTS_BUCKET=documents`
3. Run `npm run db:push` and `npm run db:seed:e2e` before E2E.
4. Start the app (`npm run dev`) and run `npm run test:e2e` or `npm run test:e2e:local` (re-seeds before tests).

CI does not run E2E (requires local Supabase or hosted test project).

## Run E2E

```bash
# Start app first
npm run dev

# In another terminal
npm run test:e2e
```

The first run will:

1. Seed Supabase Auth + Drizzle (user, profile, student profile, school, program; plus sponsor + sponsorship + disbursement when `E2E_SPONSOR_*` is set).
2. Log in as the seeded student and save auth state.
3. Log in as the seeded sponsor and save `sponsor.json` (when `E2E_SPONSOR_*` is set).
4. Run specs using that auth state.

## Seed Only (no tests)

```bash
npm run db:seed:e2e
```

## Reusable Login Helper

For tests that need to authenticate mid-flow (or for MCP Playwright / debugging):

```ts
import { loginAs } from './helpers/login';

test('example', async ({ page }) => {
  await loginAs(page, 'student');
  // Now at /dashboard/student or /auth/complete
});
```

**Prereq**: Run `npm run db:seed:e2e` first so test users exist in Supabase Auth.

## Robustness

- **Idempotent seed**: Safe to run multiple times; upserts existing rows.
- **Typed fixtures**: `tests/e2e/fixtures/e2e-personas.ts` uses env for credentials.
- **No mocks**: Real Supabase + Drizzle; follows project conventions.
- **Skip seed on setup**: Set `E2E_SEED_ON_SETUP=false` if you pre-seeded manually.
