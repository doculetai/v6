name: debug
description: >
  Systematically debug errors in the Doculet V6 stack: tRPC procedure errors,
  Drizzle query failures, Next.js App Router hydration errors, TypeScript type
  errors, Supabase auth failures, and build errors. Use when you see a runtime
  error, a tRPC INTERNAL_SERVER_ERROR, a Drizzle "column not found" error, a
  hydration mismatch warning, or a TypeScript error you can't resolve quickly.
  Trigger phrases: "debug this error", "why is this failing?", "tRPC error",
  "fix this bug", "I'm getting an error", "help me trace this".
user-invokable: true
args:
  - name: error
    description: The error message or symptom to debug (optional — will read from context if not provided)
    required: false
---

# Debug — Systematic Error Resolution

**Purpose:** Systematic root-cause identification for Doculet V6 stack errors. Never guess — trace the error to its source before suggesting a fix.

**Announce at start:** "Debugging [error type] — tracing to root cause."

## Phase 1: Identify Error Category

Classify the error into one of these categories:

| Category | Symptoms |
|----------|----------|
| **tRPC procedure** | `INTERNAL_SERVER_ERROR`, `UNAUTHORIZED`, `NOT_FOUND` in network tab or terminal |
| **Drizzle query** | `column X does not exist`, `relation X does not exist`, `null violation` |
| **TypeScript** | `error TS2345`, `error TS2339`, type mismatch in IDE |
| **Next.js hydration** | `Hydration failed`, `Text content mismatch`, flicker on first render |
| **Supabase auth** | `JWT expired`, `User not found`, session errors |
| **Build/import** | `Export X doesn't exist`, `Cannot find module`, `Module not found` |

## Phase 2: Category-Specific Investigation

### tRPC Procedure Errors

1. Find the router: `grep -r "procedureName" src/server/routers/`
2. Read the full procedure body — check the Zod input schema matches what is being sent
3. Check the procedure guard: is it `roleProcedure('X')` and the user is that role?
4. Check `ctx.db` usage — is it calling a query function or raw Drizzle inline?
5. Check if the query function exists in `src/db/queries/`
6. Add a `console.log` at the top of the procedure to confirm it is being hit

### Drizzle Query Errors

1. Find the query: locate the `.findFirst()`, `.findMany()`, or `.insert()` call
2. Check `with:` relations — every relation must be declared in the schema file
3. Check column names — Drizzle uses camelCase JS, DB uses snake_case. Check `src/db/schema/`
4. For "relation does not exist": check that the schema file exports the relation and it is imported in `src/db/index.ts`
5. For null violations: check `.notNull()` constraints vs what you are inserting

### TypeScript Errors

1. Run `npx tsc --noEmit 2>&1 | head -20` to see all errors at once
2. Do not fix symptoms — fix the type at its source
3. Never use `as X` or `@ts-ignore` — restructure the type instead
4. For `any` from tRPC: add `.output(ZodSchema)` to the procedure

### Hydration Errors

1. Look for `Date` objects rendered directly — always `.toISOString()` or format server-side
2. Look for `Math.random()` or `Date.now()` in render paths — these differ between server and client
3. Look for `localStorage`/`sessionStorage` access in Server Components
4. Check for `typeof window` guards missing where needed

### Supabase Auth Errors

1. Supabase is auth + storage ONLY — never `supabase.from()` for data
2. Check `src/server/context.ts` for how the session is extracted
3. If session is null in `ctx`, the user is not authenticated — check middleware
4. JWT expiry: check `SUPABASE_JWT_SECRET` in `.env.local`

### Build/Import Errors

1. The export name is wrong — read the source file directly to find actual export names
2. Check for circular imports — if A imports B and B imports A
3. For `.ts` vs `.tsx` confusion — files with JSX must be `.tsx`

## Phase 3: Fix and Verify

1. Apply the minimal fix to the root cause (not a workaround)
2. Run `npm run check` — must pass clean
3. Test the specific path that was failing
4. Commit only when the error is fully resolved

## Hard Rules

- Never add `@ts-ignore` as a fix
- Never use `as any` to silence a type error
- Never add `// @ts-nocheck` to a file
- Never restart the dev server as a "fix" without understanding why
- If the error persists after 3 attempts at different causes, read the full stack trace top-to-bottom before trying again
