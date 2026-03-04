#!/bin/zsh
# import-guard.sh — Continuous import architecture boundary enforcer
#
# Scans src/ .ts/.tsx files every N seconds for import boundary violations:
#   1. 'use client' files importing server-only modules (server-only, @/server/, @/db)
#   2. Server components using browser-only React hooks without 'use client'
#   3. Cross-role component imports (student/ ↔ sponsor/ etc.)
#   4. Browser API usage (window/document/localStorage/sessionStorage) without 'use client'
#   5. page.tsx importing @/db directly (must go through @/trpc/server)
#
# When violations found → invokes claude to fix the import architecture,
# commits as "fix(imports): resolve import boundary violations [import-guard]", pushes.
#
# Usage:
#   scripts/swarm/import-guard.sh [--interval 180] [--dry-run]
#
# Launch:
#   tmux new-session -d -s import-guard 'scripts/swarm/import-guard.sh'

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SRC_DIR="$ROOT_DIR/src"
LOG_DIR="$ROOT_DIR/.clawbot/logs"
LOG_FILE="$LOG_DIR/import-guard.log"
VIOLATIONS_FILE="$LOG_DIR/last-import-violations.txt"

mkdir -p "$LOG_DIR"

INTERVAL=180
DRY_RUN="false"
MAX_FIX_ROUNDS=8
FIX_COUNT=0

# All role names used in src/components/[role]/
ROLES=(student sponsor university admin agent partner)

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval) INTERVAL="$2"; shift 2 ;;
    --dry-run)  DRY_RUN="true"; shift ;;
    -h|--help)
      echo "Usage: import-guard.sh [--interval 180] [--dry-run]"
      exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# ── Sanity checks ──────────────────────────────────────────────────────────────
if ! command -v claude >/dev/null 2>&1; then
  echo "[import-guard] ERROR: claude CLI not found" | tee -a "$LOG_FILE"
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "[import-guard] ERROR: git not found" | tee -a "$LOG_FILE"
  exit 1
fi

log() {
  echo "[import-guard] $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"
}

# ── Import checks ──────────────────────────────────────────────────────────────
run_checks() {
  local violations=""

  # ── 1. 'use client' files importing server-only modules ───────────────────
  # Strategy: collect files with 'use client', then check their imports.
  # We grep for the import patterns in files that contain 'use client'.
  local server_in_client=""

  # 1a. 'use client' + import 'server-only'
  local hits_server_only
  hits_server_only=$(
    grep -rln \
      --include="*.ts" --include="*.tsx" \
      "'use client'" \
      "$SRC_DIR" 2>/dev/null \
      | xargs grep -l "from 'server-only'" 2>/dev/null \
      | grep -v node_modules \
      | grep -v "// import-guard-disable" \
      || true
  )
  if [[ -n "$hits_server_only" ]]; then
    server_in_client+="  [server-only import]:\n"
    server_in_client+="$(echo "$hits_server_only" | sed "s|$ROOT_DIR/||;s/^/    /")\n"
  fi

  # 1b. 'use client' + import from '@/server/'
  local hits_server_path
  hits_server_path=$(
    grep -rln \
      --include="*.ts" --include="*.tsx" \
      "'use client'" \
      "$SRC_DIR" 2>/dev/null \
      | xargs grep -lE "from '@/server/" 2>/dev/null \
      | grep -v node_modules \
      | grep -v "// import-guard-disable" \
      || true
  )
  if [[ -n "$hits_server_path" ]]; then
    server_in_client+="  [@/server/ import in client component]:\n"
    server_in_client+="$(echo "$hits_server_path" | sed "s|$ROOT_DIR/||;s/^/    /")\n"
  fi

  # 1c. 'use client' + import from '@/db'
  local hits_db_in_client
  hits_db_in_client=$(
    grep -rln \
      --include="*.ts" --include="*.tsx" \
      "'use client'" \
      "$SRC_DIR" 2>/dev/null \
      | xargs grep -lE "from '@/db'" 2>/dev/null \
      | grep -v node_modules \
      | grep -v "// import-guard-disable" \
      || true
  )
  if [[ -n "$hits_db_in_client" ]]; then
    server_in_client+="  [@/db import in client component]:\n"
    server_in_client+="$(echo "$hits_db_in_client" | sed "s|$ROOT_DIR/||;s/^/    /")\n"
  fi

  if [[ -n "$server_in_client" ]]; then
    violations+=$'\n\n=== SERVER-ONLY IMPORTS IN CLIENT COMPONENTS (remove server-only imports from use-client files) ===\n'
    violations+="$(printf '%b' "$server_in_client")"
  fi

  # ── 2. Server components using React hooks without 'use client' ───────────
  # Files that do NOT contain 'use client' but use useState/useEffect/useRef etc.
  # We find files containing hook calls, then filter out those that have 'use client'.
  local hooks_without_client
  hooks_without_client=$(
    grep -rlnE \
      --include="*.tsx" --include="*.ts" \
      '\b(useState|useEffect|useRef|useCallback|useMemo|useReducer|useContext|useLayoutEffect)\s*\(' \
      "$SRC_DIR" 2>/dev/null \
      | xargs grep -rL "'use client'" 2>/dev/null \
      | grep -v node_modules \
      | grep -v "\.stories\." \
      | grep -v "\.test\." \
      | grep -v "\.spec\." \
      | grep -v "tests/" \
      | grep -v "// import-guard-disable" \
      || true
  )

  if [[ -n "$hooks_without_client" ]]; then
    violations+=$'\n\n=== REACT HOOKS USED WITHOUT "use client" DIRECTIVE (add "use client" at top of file) ===\n'
    violations+="$(echo "$hooks_without_client" | sed "s|$ROOT_DIR/||;s/^/  /")"
  fi

  # ── 3. Cross-role component imports ───────────────────────────────────────
  # src/components/[roleA]/ must not import from src/components/[roleB]/
  # Shared logic must live in src/components/shared/ or be co-located.
  local cross_role=""
  for role_a in "${ROLES[@]}"; do
    local role_a_dir="$SRC_DIR/components/${role_a}"
    if [[ ! -d "$role_a_dir" ]]; then
      continue
    fi
    for role_b in "${ROLES[@]}"; do
      if [[ "$role_a" == "$role_b" ]]; then
        continue
      fi
      local hits
      hits=$(
        grep -rn \
          --include="*.ts" --include="*.tsx" \
          -E "from '@/components/${role_b}/" \
          "$role_a_dir" 2>/dev/null \
          | grep -v node_modules \
          | grep -v "// import-guard-disable" \
          || true
      )
      if [[ -n "$hits" ]]; then
        cross_role+="  [${role_a} importing ${role_b} components]:\n"
        cross_role+="$(echo "$hits" | sed "s|$ROOT_DIR/||;s/^/    /")\n"
      fi
    done
  done

  if [[ -n "$cross_role" ]]; then
    violations+=$'\n\n=== CROSS-ROLE COMPONENT IMPORTS (move shared logic to src/components/shared/ or co-locate) ===\n'
    violations+="$(printf '%b' "$cross_role")"
  fi

  # ── 4. Browser API usage without 'use client' ─────────────────────────────
  # window, document, localStorage, sessionStorage accessed without 'use client'.
  # Exclude type-checking contexts (typeof window, instanceof checks at type level).
  local browser_api_hits
  browser_api_hits=$(
    grep -rlnE \
      --include="*.tsx" --include="*.ts" \
      '\b(window\.|document\.|localStorage\.|sessionStorage\.)\w' \
      "$SRC_DIR" 2>/dev/null \
      | xargs grep -rL "'use client'" 2>/dev/null \
      | grep -v node_modules \
      | grep -v "\.stories\." \
      | grep -v "\.test\." \
      | grep -v "\.spec\." \
      | grep -v "tests/" \
      | grep -v "// import-guard-disable" \
      || true
  )

  if [[ -n "$browser_api_hits" ]]; then
    violations+=$'\n\n=== BROWSER API USAGE WITHOUT "use client" (add "use client" or move to a client component) ===\n'
    violations+="$(echo "$browser_api_hits" | sed "s|$ROOT_DIR/||;s/^/  /")"
  fi

  # ── 5. page.tsx importing @/db directly ───────────────────────────────────
  # Pages should never reach into the database directly — use @/trpc/server instead.
  local db_in_pages
  db_in_pages=$(
    find "$SRC_DIR/app" -name "page.tsx" 2>/dev/null \
      | xargs grep -lE "from '@/db'" 2>/dev/null \
      | grep -v node_modules \
      | grep -v "// import-guard-disable" \
      || true
  )

  if [[ -n "$db_in_pages" ]]; then
    violations+=$'\n\n=== DIRECT @/db IMPORT IN page.tsx (use @/trpc/server or a server action instead) ===\n'
    violations+="$(echo "$db_in_pages" | sed "s|$ROOT_DIR/||;s/^/  /")"
  fi

  echo "$violations"
}

# ── Fix prompt ─────────────────────────────────────────────────────────────────
build_fix_prompt() {
  local violations="$1"
  cat <<PROMPT
You are the V6 import architecture enforcer for Doculet (Next.js 16, React 19, TypeScript strict mode).

Fix ALL of the import boundary violations listed below. Follow these rules exactly.

IMPORT ARCHITECTURE RULES:

1. SERVER-ONLY IMPORTS IN CLIENT COMPONENTS
   - Remove 'server-only', '@/server/*', '@/db' imports from any file that has 'use client'
   - If the file needs server data: fetch it in a Server Component parent and pass as props,
     OR use a Server Action (defined in a separate file without 'use client'), OR use tRPC
   - If the file is mistakenly marked 'use client', remove the directive if it has no
     browser API calls or React hooks

2. REACT HOOKS WITHOUT 'use client'
   - Add 'use client'; as the very first line of any .tsx/.ts file that uses
     useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext, useLayoutEffect
   - Exception: custom hook files in src/lib/hooks/ should have 'use client' if they use hooks

3. CROSS-ROLE COMPONENT IMPORTS
   - src/components/[roleA]/ must NOT import from src/components/[roleB]/
   - Move the shared component to src/components/shared/ and update both import sites
   - If the component is truly role-specific and just re-used, create a thin wrapper in
     the importing role's directory that re-exports from shared/

4. BROWSER API USAGE WITHOUT 'use client'
   - Add 'use client'; as the very first line of any file that accesses
     window, document, localStorage, or sessionStorage
   - If the access is inside a typeof check (typeof window !== 'undefined'), it MIGHT be
     safe for SSR — add a comment and 'use client' anyway for clarity

5. DIRECT @/db IMPORT IN page.tsx
   - page.tsx files must not import @/db directly
   - Move the database query to a server action in a separate file:
     src/app/dashboard/[role]/[page]/actions.ts
   - OR use @/trpc/server for tRPC-backed data fetching
   - page.tsx should only call the server action or tRPC caller

NEVER:
- Use 'any' types
- Use @ts-ignore or @ts-nocheck
- Change component behavior — only fix the import paths/boundaries
- Add 'use client' to files that are purely data-fetching Server Components

After fixing ALL violations:
1. Run: npx tsc --noEmit --pretty false  (must exit clean)
2. Commit: git add src/ && git commit -m "fix(imports): resolve import boundary violations [import-guard]"

VIOLATIONS TO FIX:
$violations
PROMPT
}

# ── Main loop ──────────────────────────────────────────────────────────────────
log "Import-guard started. Scanning src/ every ${INTERVAL}s"

while true; do
  # Pull latest
  git -C "$ROOT_DIR" pull --rebase origin main >>"$LOG_FILE" 2>&1 || true

  log "Scanning import boundaries..."
  VIOLATIONS="$(run_checks)"

  if [[ -z "$VIOLATIONS" ]]; then
    log "All import boundaries clean. No violations found."
    FIX_COUNT=0
    sleep "$INTERVAL"
    continue
  fi

  VIOLATION_COUNT="$(echo "$VIOLATIONS" | grep -c '===' || echo 0)"
  log "Found $VIOLATION_COUNT violation category(ies)."
  echo "$VIOLATIONS" > "$VIOLATIONS_FILE"
  log "Details: $VIOLATIONS_FILE"

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN — skipping auto-fix."
    echo "$VIOLATIONS" >&2
    sleep "$INTERVAL"
    continue
  fi

  if [[ "$FIX_COUNT" -ge "$MAX_FIX_ROUNDS" ]]; then
    log "ERROR: Reached max fix rounds ($MAX_FIX_ROUNDS). Manual intervention required."
    break
  fi

  FIX_COUNT=$((FIX_COUNT + 1))
  log "Auto-fixing import violations (round $FIX_COUNT of max $MAX_FIX_ROUNDS)..."

  FIX_PROMPT="$(build_fix_prompt "$VIOLATIONS")"

  unset CLAUDECODE
  cd "$ROOT_DIR"
  claude \
    --model claude-sonnet-4-6 \
    --dangerously-skip-permissions \
    -p "$FIX_PROMPT" \
    >>"$LOG_FILE" 2>&1 || log "claude exited non-zero. Continuing."

  if ! git -C "$ROOT_DIR" diff --quiet HEAD 2>/dev/null; then
    git -C "$ROOT_DIR" push origin main >>"$LOG_FILE" 2>&1 || {
      log "Push failed — pulling and retrying."
      git -C "$ROOT_DIR" pull --rebase origin main >>"$LOG_FILE" 2>&1 || true
      git -C "$ROOT_DIR" push origin main >>"$LOG_FILE" 2>&1 || \
        log "ERROR: manual push required."
    }
    log "Import fixes pushed to main."
    FIX_COUNT=0
  else
    log "No files changed by auto-fixer."
  fi

  sleep "$INTERVAL"
done

log "Import-guard exiting."
