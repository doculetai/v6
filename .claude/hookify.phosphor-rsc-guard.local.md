---
name: warn-phosphor-missing-use-client
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.tsx?$
  - field: new_text
    operator: regex_match
    pattern: from ['"]@phosphor-icons/react['"]
  - field: new_text
    operator: not_contains
    pattern: 'use client'
---

**RSC CRASH RISK: Phosphor icons imported without 'use client'**

This file imports from `@phosphor-icons/react` (main package) but is missing `'use client'` as the first line.

Turbopack evaluates every module without `'use client'` in the RSC context. Phosphor's main package calls `React.createContext()` at import time, which crashes with:

> createContext is not a function

**Fix options (pick one):**

1. Add `'use client';` as the very first line of this file
2. Use the SSR-safe import instead: `from '@phosphor-icons/react/dist/ssr'`

**Rule of thumb:** Any `.tsx`/`.ts` file that imports Phosphor icons from the main package MUST have `'use client'`.
