#!/usr/bin/env python3
"""
check-phosphor-rsc.py
Ensures every file that imports from @phosphor-icons/react (main package)
has 'use client' as its first directive.

Any file without 'use client' that imports the main Phosphor package will
crash Next.js 16 / Turbopack with:
  createContext is not a function  (RSC context cannot call React.createContext)

Usage: python3 scripts/check-phosphor-rsc.py
Exit code 0 = clean, 1 = violations found.
"""

import os
import re
import sys

ROOT = os.path.join(os.path.dirname(__file__), "..", "src")
PHOSPHOR_MAIN = re.compile(r"from\s+['\"]@phosphor-icons/react['\"]")
USE_CLIENT = re.compile(r"""['"]use client['"]""")

violations = []

for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d != "node_modules"]
    for fname in filenames:
        if not (fname.endswith(".tsx") or fname.endswith(".ts")):
            continue
        fpath = os.path.join(dirpath, fname)
        with open(fpath, encoding="utf-8", errors="ignore") as f:
            content = f.read()

        if not PHOSPHOR_MAIN.search(content):
            continue

        # Type-only imports are safe (no runtime createContext call)
        phosphor_imports = re.findall(
            r"import\s+(?:type\s+)?.*from\s+['\"]@phosphor-icons/react['\"]",
            content,
        )
        if all("import type" in line for line in phosphor_imports):
            continue

        if not USE_CLIENT.search(content[:200]):
            rel = os.path.relpath(fpath, os.path.join(ROOT, ".."))
            violations.append(rel)

if violations:
    print(f"ERROR: {len(violation)} file(s) import @phosphor-icons/react without 'use client':\n")
    for v in violations:
        print(f"  {v}")
    print(
        "\nFix: add `'use client';` as the first line, "
        "or use `@phosphor-icons/react/dist/ssr` for server-safe imports."
    )
    sys.exit(1)

print(f"OK: no Phosphor RSC violations found in {ROOT}")
