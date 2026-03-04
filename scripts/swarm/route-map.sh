#!/bin/zsh
# route-map.sh — Continuous Next.js route completeness enforcer
#
# Scans src/app/dashboard/ every N seconds for route violations:
#   - page.tsx without sibling loading.tsx
#   - page.tsx without sibling error.tsx
#   - page.tsx missing "export default"
#   - layout.tsx missing <Suspense> wrapper
#   - Duplicate dynamic segments in the same directory ([id] and [programId] side-by-side)
#   - page.tsx files over 400 lines
#
# When violations found → invokes claude to create missing files / fix violations,
# commits with "fix(routes): add missing loading/error boundaries [route-map]", pushes.
#
# Usage:
#   scripts/swarm/route-map.sh [--interval 180] [--dry-run]
#
# Launch:
#   tmux new-session -d -s route-map 'scripts/swarm/route-map.sh'

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
DASHBOARD_DIR="$ROOT_DIR/src/app/dashboard"
LOG_DIR="$ROOT_DIR/.clawbot/logs"
LOG_FILE="$LOG_DIR/route-map.log"
VIOLATIONS_FILE="$LOG_DIR/last-route-violations.txt"

mkdir -p "$LOG_DIR"

INTERVAL=180
DRY_RUN="false"
MAX_FIX_ROUNDS=8
FIX_COUNT=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval) INTERVAL="$2"; shift 2 ;;
    --dry-run)  DRY_RUN="true"; shift ;;
    -h|--help)
      echo "Usage: route-map.sh [--interval 180] [--dry-run]"
      exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# ── Sanity checks ──────────────────────────────────────────────────────────────
if ! command -v claude >/dev/null 2>&1; then
  echo "[route-map] ERROR: claude CLI not found" | tee -a "$LOG_FILE"
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "[route-map] ERROR: git not found" | tee -a "$LOG_FILE"
  exit 1
fi

log() {
  echo "[route-map] $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"
}

# ── Route checks ───────────────────────────────────────────────────────────────
run_checks() {
  local violations=""

  if [[ ! -d "$DASHBOARD_DIR" ]]; then
    echo ""
    return
  fi

  # ── 1. Missing loading.tsx sibling ────────────────────────────────────────
  local missing_loading=""
  while IFS= read -r page_file; do
    local dir
    dir="$(dirname "$page_file")"
    if [[ ! -f "$dir/loading.tsx" ]]; then
      # Strip root prefix for readability
      missing_loading+="  ${page_file#$ROOT_DIR/}\n"
    fi
  done < <(find "$DASHBOARD_DIR" -name "page.tsx" 2>/dev/null)

  if [[ -n "$missing_loading" ]]; then
    violations+=$'\n\n=== MISSING loading.tsx (every page.tsx directory must have one) ===\n'
    violations+="$(printf '%b' "$missing_loading")"
  fi

  # ── 2. Missing error.tsx sibling ──────────────────────────────────────────
  local missing_error=""
  while IFS= read -r page_file; do
    local dir
    dir="$(dirname "$page_file")"
    if [[ ! -f "$dir/error.tsx" ]]; then
      missing_error+="  ${page_file#$ROOT_DIR/}\n"
    fi
  done < <(find "$DASHBOARD_DIR" -name "page.tsx" 2>/dev/null)

  if [[ -n "$missing_error" ]]; then
    violations+=$'\n\n=== MISSING error.tsx (every page.tsx directory must have one) ===\n'
    violations+="$(printf '%b' "$missing_error")"
  fi

  # ── 3. page.tsx missing "export default" ─────────────────────────────────
  local missing_default=""
  while IFS= read -r page_file; do
    if ! grep -q 'export default' "$page_file" 2>/dev/null; then
      missing_default+="  ${page_file#$ROOT_DIR/}\n"
    fi
  done < <(find "$DASHBOARD_DIR" -name "page.tsx" 2>/dev/null)

  if [[ -n "$missing_default" ]]; then
    violations+=$'\n\n=== MISSING "export default" in page.tsx (required for Next.js routing) ===\n'
    violations+="$(printf '%b' "$missing_default")"
  fi

  # ── 4. layout.tsx missing <Suspense> ──────────────────────────────────────
  local missing_suspense=""
  while IFS= read -r layout_file; do
    if ! grep -q '<Suspense' "$layout_file" 2>/dev/null; then
      missing_suspense+="  ${layout_file#$ROOT_DIR/}\n"
    fi
  done < <(find "$DASHBOARD_DIR" -name "layout.tsx" 2>/dev/null)

  if [[ -n "$missing_suspense" ]]; then
    violations+=$'\n\n=== MISSING <Suspense> in layout.tsx (layouts must wrap async children in Suspense) ===\n'
    violations+="$(printf '%b' "$missing_suspense")"
  fi

  # ── 5. Duplicate dynamic segments in same directory ───────────────────────
  # A directory has duplicate dynamic segments if it contains 2+ subdirs that
  # match the [param] pattern at the same level.
  local dup_segments=""
  while IFS= read -r dir; do
    local dynamic_dirs
    # List immediate children that are dynamic segments
    dynamic_dirs="$(
      find "$dir" -maxdepth 1 -mindepth 1 -type d -name '\[*\]' 2>/dev/null \
        | sed "s|$ROOT_DIR/||" \
        | sort \
        || true
    )"
    local count
    count="$(echo "$dynamic_dirs" | grep -c '.' || echo 0)"
    if [[ "$count" -gt 1 ]]; then
      dup_segments+="  Directory: ${dir#$ROOT_DIR/}\n"
      dup_segments+="$(echo "$dynamic_dirs" | sed 's/^/    /')\n"
    fi
  done < <(find "$DASHBOARD_DIR" -type d 2>/dev/null)

  if [[ -n "$dup_segments" ]]; then
    violations+=$'\n\n=== DUPLICATE DYNAMIC SEGMENTS in same directory (causes Next.js routing conflict) ===\n'
    violations+="$(printf '%b' "$dup_segments")"
  fi

  # ── 6. page.tsx over 400 lines ────────────────────────────────────────────
  local long_pages=""
  while IFS= read -r page_file; do
    local line_count
    line_count="$(wc -l < "$page_file" 2>/dev/null || echo 0)"
    if [[ "$line_count" -gt 400 ]]; then
      long_pages+="  ${page_file#$ROOT_DIR/} (${line_count} lines)\n"
    fi
  done < <(find "$DASHBOARD_DIR" -name "page.tsx" 2>/dev/null)

  if [[ -n "$long_pages" ]]; then
    violations+=$'\n\n=== page.tsx FILES OVER 400 LINES (split responsibility — extract sub-components) ===\n'
    violations+="$(printf '%b' "$long_pages")"
  fi

  echo "$violations"
}

# ── Fix prompt ─────────────────────────────────────────────────────────────────
build_fix_prompt() {
  local violations="$1"
  cat <<PROMPT
You are the V6 route completeness enforcer for Doculet (Next.js 16, App Router, TypeScript strict mode).

Fix ALL of the route violations listed below. Follow these rules exactly.

LOADING.TSX TEMPLATE (use this exact template for every missing loading.tsx):
\`\`\`tsx
export default function Loading() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
    </div>
  );
}
\`\`\`

ERROR.TSX TEMPLATE (use this exact template for every missing error.tsx):
\`\`\`tsx
'use client';
import { useEffect } from 'react';
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">
      <p className="text-sm text-muted-foreground">Something went wrong.</p>
      <button onClick={reset} className="text-sm text-primary underline">
        Try again
      </button>
    </div>
  );
}
\`\`\`

RULES:
- Missing loading.tsx: create it in the SAME directory as page.tsx using the template above
- Missing error.tsx: create it in the SAME directory as page.tsx using the template above
- Missing "export default" in page.tsx: add a proper default export (keep existing named exports)
- Missing <Suspense> in layout.tsx: wrap the {children} prop in <Suspense fallback={<Loading />}>
  and import Loading from './loading' (create loading.tsx in the layout dir if it doesn't exist)
- Duplicate dynamic segments: rename one segment to avoid the conflict, e.g., [id] + [programId]
  in the same dir → move one to a sub-path like programs/[programId]
- page.tsx over 400 lines: split by extracting the page's main content into a
  [page-name]-page-client.tsx Client Component or [page-name]-page.tsx Server Component.
  The page.tsx becomes a thin wrapper that imports and renders the extracted component.
- NEVER use 'any' types
- NEVER change component behavior — only add missing files or restructure responsibility

After fixing ALL violations:
1. Run: npx tsc --noEmit --pretty false  (must exit clean)
2. Commit: git add src/ && git commit -m "fix(routes): add missing loading/error boundaries [route-map]"

VIOLATIONS TO FIX:
$violations
PROMPT
}

# ── Main loop ──────────────────────────────────────────────────────────────────
log "Route-map started. Scanning src/app/dashboard/ every ${INTERVAL}s"

while true; do
  # Pull latest
  git -C "$ROOT_DIR" pull --rebase origin main >>"$LOG_FILE" 2>&1 || true

  log "Scanning route completeness..."
  VIOLATIONS="$(run_checks)"

  if [[ -z "$VIOLATIONS" ]]; then
    log "All routes complete. No violations found."
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
  log "Auto-fixing route violations (round $FIX_COUNT of max $MAX_FIX_ROUNDS)..."

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
    log "Route fixes pushed to main."
    FIX_COUNT=0
  else
    log "No files changed by auto-fixer."
  fi

  sleep "$INTERVAL"
done

log "Route-map exiting."
