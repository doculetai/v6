---
name: trpc-audit
description: >
  Audit all tRPC routers in src/server/routers/ for security gaps and quality issues.
  Checks for: procedures missing roleProcedure guard (exposed to wrong roles), missing
  Zod output schemas (untyped returns), any types in procedure bodies, procedures
  over 50 lines (should be split to src/db/queries/), and publicProcedure used
  where protectedProcedure is needed. Use when adding new procedures, after a
  security review, or when /security-scan returns tRPC-related findings. Trigger
  phrases: "audit tRPC", "check procedure guards", "missing roleProcedure",
  "tRPC security review", "check all routers", "are all endpoints protected?".
user-invokable: true
args:
  - name: router
    description: Specific router to audit (e.g. "student", "admin"). Defaults to all routers.
    required: false
---

# tRPC Audit — Security and Quality

**Purpose:** Systematic audit of all tRPC procedures for security and quality. Returns a prioritised findings list.

**Announce at start:** "Auditing tRPC routers for security gaps and quality issues."

## Checks to Run

### Check 1: Missing role guards (CRITICAL)

For every procedure in `src/server/routers/`, verify:
- Student data endpoints use `roleProcedure('student')` — not `protectedProcedure`
- Admin-only operations use `roleProcedure('admin')`
- Sponsor data uses `roleProcedure('sponsor')`
- University data uses `roleProcedure('university')`
- Agent data uses `roleProcedure('agent')`
- Partner data uses `roleProcedure('partner')`
- `publicProcedure` is ONLY used for genuinely unauthenticated endpoints (certificate verification, invite accept)

**CRITICAL FAIL:** Any procedure with role-specific data that uses `protectedProcedure` instead of `roleProcedure`.

### Check 2: Missing output schemas (HIGH)

Every procedure must have `.output(ZodSchema)`. Check for:
- Procedures with no `.output()` call
- Procedures with `.output(z.any())` or `.output(z.unknown())`
- Mutation procedures that return data without an output schema

**FAIL:** Any procedure missing a typed output schema.

### Check 3: `any` types (HIGH)

Grep each router file for:
- `: any` in type annotations
- `as any` casts
- `@ts-ignore` or `@ts-nocheck` comments

**FAIL:** Any `any` type in procedure bodies.

### Check 4: Oversized procedures (MEDIUM)

Count lines per procedure. Procedures over 50 lines should be split:
- Query logic to `src/db/queries/[domain].ts` as a pure function
- Side effects to a separate helper in `src/lib/`

**WARN:** Procedure over 50 lines. **FAIL:** Procedure over 100 lines.

### Check 5: Input validation completeness (MEDIUM)

For every `.input(schema)`:
- String fields should have `.min(1)` or `.max(N)` where appropriate
- UUID fields should use `z.string().uuid()`
- Amounts should use `z.number().int().positive()` (kobo)
- No `z.string()` without constraints on user-provided text fields

**WARN:** Unconstrained string inputs on mutation procedures.

## Report Format

```
## tRPC Audit — [router or "all routers"]

### Critical Findings (must fix before merge)
| Router | Procedure | Issue |
|--------|-----------|-------|
| student | getBalance | uses protectedProcedure — should be roleProcedure('student') |

### High Severity
| Router | Procedure | Issue |
|--------|-----------|-------|
| admin | approveDoc | missing .output() schema |

### Medium Severity
| Router | Procedure | Issue |
|--------|-----------|-------|
| partner | listWebhooks | 78 lines — extract to src/db/queries/partner-webhooks.ts |

### Summary
- Critical: N
- High: N
- Medium: N
- Passed: N procedures with no findings

### Verdict: CLEAN / NEEDS FIXES
```

