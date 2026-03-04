#!/bin/zsh
# eslint-watch.sh — Continuous ESLint enforcer
#
# Runs ESLint on files changed since the last check.
# Auto-fixes what ESLint can fix. Passes remaining errors to claude.
# Commits and pushes clean fixes to main.
#
# Usage:
#   scripts/swarm/eslint-watch.sh [--interval 150] [--dry-run]
#
# Launch:
#   tmux new-session -d -s eslint-watch 'scripts/swarm/eslint-watch.sh'

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
LOG_DIR="$ROOT_DIR/.clawbot/logs"
LOG_FILE="$LOG_DIR/eslint-watch.log"
ERRORS_FILE="$LOG_DIR/last-eslint-errors.txt"
STATE_FILE="$LOG_DIR/eslint-watch-state.json"

mkdir -p "$LOG_DIR"

INTERVAL=150
DRY_RUN="false"
MAX_FIX_ROUNDS=8
FIX_COUNT=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval) INTERVAL="$2"; shift 2 ;;
    --dry-run)  DRY_RUN="true"; shift ;;
    -h|--help)
      echo "Usage: eslint-watch.sh [--interval 150] [--dry-run]"
      exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

log() {
  echo "[eslint-watch] $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"
}

# Track last-seen commit so we only scan changed files
get_last_commit() {
  git -C "$ROOT_DIR" rev-parse HEAD 2>/dev/null || echo ""
}

get_saved_commit() {
  if [[ -f "$STATE_FILE" ]]; then
    node -e "const s=require('$STATE_FILE'); console.log(s.lastCommit||'')" 2>/dev/null || echo ""
  else
    echo ""
  fi
}

save_commit() {
  local commit="$1"
  echo "{\"lastCommit\":\"$commit\"}" > "$STATE_FILE"
}

get_changed_files() {
  local from="$1"
  local to="$2"
  if [[ -z "$from" ]]; then
    # First run — scan all src files
    find "$ROOT_DIR/src" \( -name "*.ts" -o -name "*.tsx" \) \
      | grep -v node_modules | grep -v "\.stories\." | tr '\n' ' '
  else
    git -C "$ROOT_DIR" diff --name-only "$from" "$to" 2>/dev/null \
      | grep -E '\.(ts|tsx)$' \
      | grep "^src/" \
      | grep -v "\.stories\." \
      | sed "s|^|$ROOT_DIR/|" \
      | tr '\n' ' ' || echo ""
  fi
}

run_eslint_fix() {
  local files="$1"
  if [[ -z "$files" ]]; then
    echo ""
    return
  fi
  cd "$ROOT_DIR"
  # Run with --fix first, capture remaining errors
  npx eslint \
    --fix \
    --ext .ts,.tsx \
    --format compact \
    $files \
    2>/dev/null || true
  # Now re-run without --fix to get remaining errors
  npx eslint \
    --ext .ts,.tsx \
    --format compact \
    $files \
    2>/dev/null || true
}

has_lint_errors() {
  local output="$1"
  [[ -n "$output" && "$output" != *"0 problems"* ]] && \
  echo "$output" | grep -qE 'error|warning' 2>/dev/null
}

build_fix_prompt() {
  local errors="$1"
  cat <<PROMPT
You are a code quality fixer for the Doculet V6 codebase (Next.js 16, TypeScript strict mode).

ESLint reported the following errors that could NOT be auto-fixed. Fix all of them now.

RULES:
- Fix ONLY what ESLint flagged — do not change surrounding code
- 'react-hooks/exhaustive-deps': add the missing dependency to the dependency array,
  OR extract the value outside the effect if it doesn't belong there
- 'no-unused-vars': remove the variable, or prefix with _ if it must stay in scope
- '@typescript-eslint/no-explicit-any': replace 'any' with the correct type
- 'react/display-name': add displayName or convert to named function
- 'import/no-cycle': refactor the import to break the cycle (move shared types to a types file)
- After fixing: run npx eslint src --ext .ts,.tsx --format compact to verify 0 errors
- If clean: git add src/ && git commit -m "fix(lint): resolve ESLint violations [eslint-watch]"

ERRORS:
$errors
PROMPT
}

# ── Main loop ─────────────────────────────────────────────────────────────────
log "ESLint-watch started. Interval: ${INTERVAL}s"

while true; do
  # Pull latest
  git -C "$ROOT_DIR" pull --rebase origin main >>"$LOG_FILE" 2>&1 || true

  CURRENT_COMMIT="$(get_last_commit)"
  LAST_COMMIT="$(get_saved_commit)"

  CHANGED_FILES="$(get_changed_files "$LAST_COMMIT" "$CURRENT_COMMIT")"

  if [[ -z "$CHANGED_FILES" && -n "$LAST_COMMIT" ]]; then
    log "No .ts/.tsx files changed since last check. Skipping."
    save_commit "$CURRENT_COMMIT"
    sleep "$INTERVAL"
    continue
  fi

  FILE_COUNT=$(echo "$CHANGED_FILES" | wc -w | tr -d ' ')
  log "Linting $FILE_COUNT changed file(s)..."

  ERRORS="$(run_eslint_fix "$CHANGED_FILES" 2>/dev/null || true)"

  # After --fix pass, commit auto-fixable changes first
  if ! git -C "$ROOT_DIR" diff --quiet 2>/dev/null; then
    if [[ "$DRY_RUN" != "true" ]]; then
      log "ESLint auto-fixed some issues. Committing..."
      git -C "$ROOT_DIR" add src/
      git -C "$ROOT_DIR" commit -m "fix(lint): eslint --fix pass [eslint-watch]" \
        >>"$LOG_FILE" 2>&1 || true
      git -C "$ROOT_DIR" push origin main >>"$LOG_FILE" 2>&1 || true
    else
      log "DRY RUN — would commit eslint --fix changes."
    fi
  fi

  if ! has_lint_errors "$ERRORS"; then
    log "Lint clean after auto-fix."
    FIX_COUNT=0
    save_commit "$CURRENT_COMMIT"
    sleep "$INTERVAL"
    continue
  fi

  echo "$ERRORS" > "$ERRORS_FILE"
  ERROR_COUNT=$(echo "$ERRORS" | grep -cE 'error' || echo 0)
  log "Found $ERROR_COUNT lint error(s) requiring manual fix."

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN — skipping claude fix."
    cat "$ERRORS_FILE" >&2
    save_commit "$CURRENT_COMMIT"
    sleep "$INTERVAL"
    continue
  fi

  if [[ "$FIX_COUNT" -ge "$MAX_FIX_ROUNDS" ]]; then
    log "ERROR: Reached max fix rounds ($MAX_FIX_ROUNDS). Manual intervention required."
    break
  fi

  FIX_COUNT=$((FIX_COUNT + 1))
  log "Invoking claude for lint fix (round $FIX_COUNT)..."

  FIX_PROMPT="$(build_fix_prompt "$ERRORS")"

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
    log "Lint fixes pushed. FIX_COUNT reset."
    FIX_COUNT=0
  else
    log "No changes from claude lint fix."
  fi

  save_commit "$CURRENT_COMMIT"
  sleep "$INTERVAL"
done

log "ESLint-watch exiting."
