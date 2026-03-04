#!/bin/zsh
# build-watch.sh — Continuous TypeScript build monitor + auto-fixer
#
# Runs typecheck every N seconds on main.
# When errors are found, invokes claude to auto-fix and commits to main.
# Agents building in worktrees automatically inherit clean contracts on next pull.
#
# Usage:
#   scripts/swarm/build-watch.sh [--interval 120] [--branch main] [--dry-run]
#
# Launch in background:
#   tmux new-session -d -s build-watch 'scripts/swarm/build-watch.sh'

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
LOG_DIR="$ROOT_DIR/.clawbot/logs"
LOG_FILE="$LOG_DIR/build-watch.log"
FIX_LOG="$LOG_DIR/build-fixes.log"

mkdir -p "$LOG_DIR"

# ── Args ─────────────────────────────────────────────────────────────────────
INTERVAL=120        # seconds between checks
WATCH_BRANCH="main"
DRY_RUN="false"
MAX_FIXES=10        # safety: stop after N consecutive auto-fix rounds

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval) INTERVAL="$2"; shift 2 ;;
    --branch)   WATCH_BRANCH="$2"; shift 2 ;;
    --dry-run)  DRY_RUN="true"; shift ;;
    -h|--help)
      cat <<USAGE
Usage: scripts/swarm/build-watch.sh [--interval 120] [--branch main] [--dry-run]

Monitors the repo's TypeScript build and auto-fixes errors using claude.

Options:
  --interval N    Seconds between typecheck runs (default: 120)
  --branch NAME   Branch to watch and commit fixes to (default: main)
  --dry-run       Report errors but don't auto-fix or commit
USAGE
      exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

# ── Sanity checks ─────────────────────────────────────────────────────────────
if ! command -v claude >/dev/null 2>&1; then
  echo "[build-watch] ERROR: claude CLI not found" | tee -a "$LOG_FILE"
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "[build-watch] ERROR: git not found" | tee -a "$LOG_FILE"
  exit 1
fi

# ── Helpers ───────────────────────────────────────────────────────────────────
log() {
  local msg="[build-watch] $(date '+%Y-%m-%d %H:%M:%S') $*"
  echo "$msg" | tee -a "$LOG_FILE"
}

log_fix() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$FIX_LOG"
}

ensure_on_branch() {
  local current
  current="$(git -C "$ROOT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
  if [[ "$current" != "$WATCH_BRANCH" ]]; then
    log "WARNING: currently on '$current', expected '$WATCH_BRANCH'. Switching..."
    git -C "$ROOT_DIR" checkout "$WATCH_BRANCH" 2>>"$LOG_FILE" || {
      log "ERROR: cannot switch to $WATCH_BRANCH"
      return 1
    }
  fi
}

pull_latest() {
  git -C "$ROOT_DIR" pull --rebase origin "$WATCH_BRANCH" >>"$LOG_FILE" 2>&1 || true
}

run_typecheck() {
  # Returns 0 if clean, 1 if errors. Writes errors to stdout.
  cd "$ROOT_DIR"
  npx tsc --noEmit --pretty false 2>&1 || true
}

has_errors() {
  local output="$1"
  # tsc exits 0 with no output when clean
  [[ -n "$output" && "$output" == *"error TS"* ]]
}

# ── Fix prompt ────────────────────────────────────────────────────────────────
build_fix_prompt() {
  local errors="$1"
  cat <<PROMPT
You are a TypeScript build fixer for the Doculet V6 codebase (Next.js 16, Tailwind 4, strict mode).

The following TypeScript errors were found in the main branch. Fix ALL of them now.

RULES:
- Fix errors with MINIMAL changes — do not refactor surrounding code
- If an export is missing from a module, add it (do not restructure the module)
- If an import references a non-existent export, either add the export OR fix the import path
- If a type is wrong, correct the type — do not use 'any' or 'as unknown'
- Respect the existing file patterns (copy from config, semantic tokens only, no emojis, no inline styles)
- After fixing, run: npx tsc --noEmit --pretty false
- If typecheck is clean, commit with: git add -A && git commit -m "fix(types): auto-fix TypeScript build errors [build-watch]"
- If errors remain, fix them too before committing

ERRORS TO FIX:
$errors

Fix everything above, then verify with typecheck, then commit.
PROMPT
}

# ── Main loop ─────────────────────────────────────────────────────────────────
FIX_COUNT=0
log "Build-watch started. Watching branch: $WATCH_BRANCH, interval: ${INTERVAL}s"

while true; do
  # Sync to latest main
  ensure_on_branch || { sleep "$INTERVAL"; continue; }
  pull_latest

  log "Running typecheck..."
  ERRORS="$(run_typecheck)"

  if ! has_errors "$ERRORS"; then
    log "Build clean. No errors found."
    FIX_COUNT=0
    sleep "$INTERVAL"
    continue
  fi

  ERROR_COUNT="$(echo "$ERRORS" | grep -c 'error TS' || echo 0)"
  log "Found ${ERROR_COUNT} TypeScript error(s)."

  # Write errors to temp file for inspection
  ERRORS_FILE="$LOG_DIR/last-build-errors.txt"
  echo "$ERRORS" > "$ERRORS_FILE"
  log "Errors written to: $ERRORS_FILE"

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN — skipping auto-fix."
    echo "=== BUILD ERRORS ===" >&2
    echo "$ERRORS" >&2
    sleep "$INTERVAL"
    continue
  fi

  if [[ "$FIX_COUNT" -ge "$MAX_FIXES" ]]; then
    log "ERROR: Reached max consecutive fix rounds ($MAX_FIXES). Stopping to prevent loop."
    log "Manual intervention required. Last errors in: $ERRORS_FILE"
    break
  fi

  FIX_COUNT=$((FIX_COUNT + 1))
  log "Auto-fixing (round $FIX_COUNT of max $MAX_FIXES)..."
  log_fix "Round $FIX_COUNT: $ERROR_COUNT errors"
  log_fix "$ERRORS"
  log_fix "---"

  FIX_PROMPT="$(build_fix_prompt "$ERRORS")"

  # Invoke claude to fix errors — print-mode, no-approvals, fully autonomous
  unset CLAUDECODE
  cd "$ROOT_DIR"
  claude \
    --model claude-sonnet-4-6 \
    --dangerously-skip-permissions \
    -p "$FIX_PROMPT" \
    >>"$LOG_FILE" 2>&1 || {
      log "claude exited with non-zero. Continuing watch loop."
    }

  # Push fixes so worktrees can pull clean contracts
  if git -C "$ROOT_DIR" diff --quiet HEAD 2>/dev/null; then
    log "No changes committed by auto-fixer. Errors may need manual resolution."
  else
    log "Auto-fix committed changes."
    git -C "$ROOT_DIR" push origin "$WATCH_BRANCH" >>"$LOG_FILE" 2>&1 || {
      log "WARNING: push failed. Another agent may have pushed ahead — pulling and retrying."
      git -C "$ROOT_DIR" pull --rebase origin "$WATCH_BRANCH" >>"$LOG_FILE" 2>&1 || true
      git -C "$ROOT_DIR" push origin "$WATCH_BRANCH" >>"$LOG_FILE" 2>&1 || \
        log "ERROR: push failed again. Manual push required."
    }
  fi

  sleep "$INTERVAL"
done

log "Build-watch exiting."
