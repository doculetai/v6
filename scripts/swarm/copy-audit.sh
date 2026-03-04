#!/bin/zsh
# copy-audit.sh — Continuous copy config coverage enforcer
#
# Scans every N seconds for copy architecture violations:
#   1. All 6 roles have a file in src/config/copy/[role].ts
#   2. Each copy config file exports a const (not just types)
#   3. No TODO/TBD/placeholder/Lorem in copy config files
#   4. No hardcoded generic button labels in JSX (<Button>Submit</Button> etc.)
#   5. Copy config files don't create circular deps (import from @/config/copy/ only)
#
# When violations found → invokes claude to create missing files or extract
# hardcoded strings, commits as "fix(copy): complete copy config coverage [copy-audit]",
# pushes to main.
#
# Usage:
#   scripts/swarm/copy-audit.sh [--interval 180] [--dry-run]
#
# Launch:
#   tmux new-session -d -s copy-audit 'scripts/swarm/copy-audit.sh'

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SRC_DIR="$ROOT_DIR/src"
COPY_DIR="$SRC_DIR/config/copy"
LOG_DIR="$ROOT_DIR/.clawbot/logs"
LOG_FILE="$LOG_DIR/copy-audit.log"
VIOLATIONS_FILE="$LOG_DIR/last-copy-violations.txt"

mkdir -p "$LOG_DIR"

INTERVAL=180
DRY_RUN="false"
MAX_FIX_ROUNDS=8
FIX_COUNT=0

# All 6 roles that must have copy config files
REQUIRED_ROLES=(student sponsor university admin agent partner)

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval) INTERVAL="$2"; shift 2 ;;
    --dry-run)  DRY_RUN="true"; shift ;;
    -h|--help)
      echo "Usage: copy-audit.sh [--interval 180] [--dry-run]"
      exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# ── Sanity checks ──────────────────────────────────────────────────────────────
if ! command -v claude >/dev/null 2>&1; then
  echo "[copy-audit] ERROR: claude CLI not found" | tee -a "$LOG_FILE"
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "[copy-audit] ERROR: git not found" | tee -a "$LOG_FILE"
  exit 1
fi

log() {
  echo "[copy-audit] $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"
}

# ── Copy checks ────────────────────────────────────────────────────────────────
run_checks() {
  local violations=""

  # ── 1. Missing role copy config files ─────────────────────────────────────
  local missing_roles=""
  for role in "${REQUIRED_ROLES[@]}"; do
    if [[ ! -f "$COPY_DIR/${role}.ts" ]]; then
      missing_roles+="  src/config/copy/${role}.ts\n"
    fi
  done

  if [[ -n "$missing_roles" ]]; then
    violations+=$'\n\n=== MISSING ROLE COPY CONFIG FILES (all 6 roles must have src/config/copy/[role].ts) ===\n'
    violations+="$(printf '%b' "$missing_roles")"
  fi

  # ── 2. Copy config files with no exported const ───────────────────────────
  # A copy config file must export at least one const (not just type/interface)
  local no_export=""
  for role in "${REQUIRED_ROLES[@]}"; do
    local file="$COPY_DIR/${role}.ts"
    if [[ -f "$file" ]]; then
      if ! grep -q 'export const ' "$file" 2>/dev/null; then
        no_export+="  src/config/copy/${role}.ts (no 'export const' found)\n"
      fi
    fi
  done

  if [[ -n "$no_export" ]]; then
    violations+=$'\n\n=== COPY CONFIG FILES WITH NO EXPORTED CONST (must export at least one const, not just types) ===\n'
    violations+="$(printf '%b' "$no_export")"
  fi

  # ── 3. Placeholder/TODO strings in copy config files ─────────────────────
  local placeholder_hits
  placeholder_hits=$(
    grep -rn \
      --include="*.ts" \
      -iE '(TODO|TBD|placeholder|Lorem|ipsum|FIXME|coming soon|to be determined)' \
      "$COPY_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "// copy-audit-disable" \
      || true
  )

  if [[ -n "$placeholder_hits" ]]; then
    violations+=$'\n\n=== PLACEHOLDER / TODO STRINGS IN COPY CONFIG (write real copy — no TODO/TBD/Lorem) ===\n'
    violations+="$placeholder_hits"
  fi

  # ── 4. Hardcoded generic button labels in JSX ─────────────────────────────
  # Matches literal text children: <Button>Submit</Button>, <Button>Save</Button>, etc.
  # These should come from copy config, not be hardcoded.
  local hardcoded_buttons
  hardcoded_buttons=$(
    grep -rn \
      --include="*.tsx" \
      -E '<(Button|button)[^>]*>(Submit|Save|Cancel|Continue|Confirm|Delete|Update|Create|Add|Next|Back|Done|Close|OK|Yes|No)</(Button|button)>' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "\.stories\." \
      | grep -v "src/config/copy" \
      | grep -v "// copy-audit-disable" \
      || true
  )

  if [[ -n "$hardcoded_buttons" ]]; then
    violations+=$'\n\n=== HARDCODED BUTTON LABELS IN JSX (move to src/config/copy/[role].ts) ===\n'
    violations+="$hardcoded_buttons"
  fi

  # ── 5. Circular dependency risk: copy config importing from non-copy paths ─
  # Copy config files should only import from: types, other config files, or nothing.
  # They must NOT import from components, hooks, lib, app, or server-only modules.
  local circular_hits
  circular_hits=$(
    grep -rn \
      --include="*.ts" \
      -E "from '@/(components|hooks|lib|app|server|db|trpc)/" \
      "$COPY_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "// copy-audit-disable" \
      || true
  )

  if [[ -n "$circular_hits" ]]; then
    violations+=$'\n\n=== CIRCULAR DEP RISK IN COPY CONFIG (copy files must only import types — not components/hooks/lib) ===\n'
    violations+="$circular_hits"
  fi

  echo "$violations"
}

# ── Fix prompt ─────────────────────────────────────────────────────────────────
build_fix_prompt() {
  local violations="$1"
  cat <<PROMPT
You are the V6 copy config enforcer for Doculet (Next.js 16, TypeScript strict mode).

Fix ALL of the copy architecture violations listed below. Follow these rules exactly.

COPY CONFIG STRUCTURE RULES:
- Every role (student, sponsor, university, admin, agent, partner) must have
  src/config/copy/[role].ts
- Each file must export at least one const object containing real UI copy strings
- Copy files MUST NOT import from @/components, @/hooks, @/lib, @/app, @/db, @/trpc
  (they may import from @/config/copy/shared or @/lib/types only)
- All copy is real, warm, and confident — never generic, never TODO/TBD/Lorem

WHEN CREATING A MISSING COPY CONFIG FILE, follow this pattern:
\`\`\`ts
// src/config/copy/[role].ts
// Copy strings for the [Role] dashboard. Import this in [role] pages/components.

export const [role]Copy = {
  nav: {
    // fill in navigation labels for this role's dashboard sections
  },
  dashboard: {
    heading: 'Welcome back',  // replace with role-appropriate heading
    // add relevant sections
  },
  // add more sections as needed
} as const;

export type [Role]Copy = typeof [role]Copy;
\`\`\`

WHEN EXTRACTING HARDCODED BUTTON LABELS:
1. Find which role's page/component the JSX lives in
2. Add the label string to that role's copy config under a relevant key
3. Import the copy config in the component and replace the hardcoded string
4. Example: <Button>Submit</Button> → <Button>{studentCopy.forms.submit}</Button>

WHEN FIXING PLACEHOLDER STRINGS:
- Replace TODO/TBD/Lorem with real, contextually appropriate copy for that role
- Copy tone: warm, professional, fintech-grade — never bald/generic

After fixing ALL violations:
1. Run: npx tsc --noEmit --pretty false  (must exit clean)
2. Commit: git add src/ && git commit -m "fix(copy): complete copy config coverage [copy-audit]"

VIOLATIONS TO FIX:
$violations
PROMPT
}

# ── Main loop ──────────────────────────────────────────────────────────────────
log "Copy-audit started. Scanning src/config/copy/ and src/ every ${INTERVAL}s"

while true; do
  # Pull latest
  git -C "$ROOT_DIR" pull --rebase origin main >>"$LOG_FILE" 2>&1 || true

  log "Scanning copy config coverage..."
  VIOLATIONS="$(run_checks)"

  if [[ -z "$VIOLATIONS" ]]; then
    log "Copy config coverage complete. No violations found."
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
  log "Auto-fixing copy violations (round $FIX_COUNT of max $MAX_FIX_ROUNDS)..."

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
    log "Copy fixes pushed to main."
    FIX_COUNT=0
  else
    log "No files changed by auto-fixer."
  fi

  sleep "$INTERVAL"
done

log "Copy-audit exiting."
