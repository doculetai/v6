---
name: scaffold
description: >
  Scaffold a complete new dashboard route with all required files for Doculet.
  Use when adding a new page to any role's dashboard — creates page.tsx,
  *-page-client.tsx, loading.tsx, error.tsx, copy config entry, nav config entry,
  and stub tRPC procedure. Ensures layout primitives, error boundaries, and loading
  skeletons are present from day one. Trigger phrases: "create a new page",
  "add a route", "scaffold the [name] page", "new dashboard route", "set up the
  [feature] page for [role]".
user-invokable: true
args:
  - name: route
    description: Route name and role, e.g. "statements for student" or "queue for admin"
    required: true
---

# Scaffold — New Dashboard Route

**Purpose:** Create a complete, production-ready dashboard route with all 7 required files. No stubs, no TODOs — every file compiles and renders correctly on first run.

**Announce at start:** "Scaffolding [route] for [role] — creating all 7 required files."

## Before You Begin

1. Read `src/config/nav/[role].ts` to understand the nav structure for the target role
2. Read `src/config/copy/[role].ts` to understand the copy file structure
3. Check `src/app/dashboard/[role]/` to confirm the route does not already exist
4. Read one existing page (e.g. `src/app/dashboard/[role]/overview/`) to understand the page pattern

## Workflow

### Step 1: Create the route directory

```bash
mkdir -p src/app/dashboard/[role]/[route-name]
```

### Step 2: Write `page.tsx` (Server Component)

```typescript
// src/app/dashboard/[role]/[route-name]/page.tsx
import type { Metadata } from 'next';
import { api } from '@/trpc/server';
import { RouteNamePageClient } from './[route-name]-page-client';

export const metadata: Metadata = {
  title: '[Page Title] — Doculet',
};

export default async function RouteNamePage() {
  const caller = await api();
  // fetch data here
  return <RouteNamePageClient />;
}
```

### Step 3: Write `[route-name]-page-client.tsx` (Client Component)

```typescript
// src/app/dashboard/[role]/[route-name]/[route-name]-page-client.tsx
'use client';

import { PageShell, Section, PageHeader, Stack } from '@/components/layout/content-primitives';
import { roleCopy } from '@/config/copy/[role]';

type RouteNamePageClientProps = {
  // define props from server fetch
};

export function RouteNamePageClient({}: RouteNamePageClientProps) {
  const copy = roleCopy.routeName;
  return (
    <PageShell>
      <Section>
        <PageHeader title={copy.title} description={copy.description} />
        <Stack gap="md">
          {/* content */}
        </Stack>
      </Section>
    </PageShell>
  );
}
```

### Step 4: Write `loading.tsx`

```typescript
// src/app/dashboard/[role]/[route-name]/loading.tsx
import { PageShell, Section, Stack } from '@/components/layout/content-primitives';
import { Skeleton } from '@/components/ui/skeleton';

export default function RouteNameLoading() {
  return (
    <PageShell>
      <Section>
        <Stack gap="md">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </Stack>
      </Section>
    </PageShell>
  );
}
```

### Step 5: Write `error.tsx`

```typescript
// src/app/dashboard/[role]/[route-name]/error.tsx
'use client';

import { useEffect } from 'react';
import { PageShell, Section } from '@/components/layout/content-primitives';
import { sharedCopy } from '@/config/copy/shared';

export default function RouteNameError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const copy = sharedCopy.errorBoundary;
  return (
    <PageShell>
      <Section>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm font-medium text-foreground">{copy.heading}</p>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
          <button
            onClick={reset}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {copy.retry}
          </button>
        </div>
      </Section>
    </PageShell>
  );
}
```

### Step 6: Add copy to `src/config/copy/[role].ts`

Add a new key to the role copy file:

```typescript
routeName: {
  title: '[Page Title]',
  description: '[One-line description of what this page shows]',
  empty: {
    heading: '[Empty state heading]',
    description: '[What the user should do when empty]',
    cta: '[Action]',
  },
},
```

### Step 7: Add nav entry to `src/config/nav/[role].ts`

Add the route to the nav config. Check whether it is a top-level nav item or a sub-item. Follow the existing pattern in the file exactly.

### Step 8: Add stub tRPC procedure

In the relevant router (`src/server/routers/[role].ts`), add a minimal procedure:

```typescript
getRouteName: roleProcedure('[role]')
  .output(z.array(z.object({ id: z.string() })))
  .query(async ({ ctx }) => {
    return [];
  }),
```

### Step 9: Verify

```bash
npm run check
npm run layout-check
```

Fix any errors before committing.

### Step 10: Commit

```bash
git add src/app/dashboard/[role]/[route-name]/ \
        src/config/copy/[role].ts \
        src/config/nav/[role].ts \
        src/server/routers/[role].ts
git commit -m "feat([role]): scaffold [route-name] route — page, loading, error, copy, nav, stub procedure"
```

## Validation Rules

- `page.tsx` must have `export const metadata`
- `loading.tsx` must use layout primitives (no raw divs)
- `error.tsx` must be `'use client'`, must have `reset` prop, must use copy config
- Copy entry must be in correct role file
- Nav entry label must match the page H1 exactly
- `npm run check` must pass clean

## Hard Rules

- Never use raw `<div className="mx-auto max-w-...">` — use PageShell/Section
- Never hardcode strings in JSX — all copy from config
- Never use Lucide icons — Phosphor Duotone only
- Never emit emoji anywhere
