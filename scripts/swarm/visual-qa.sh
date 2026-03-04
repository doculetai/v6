#!/bin/zsh
# visual-qa.sh — Continuous visual regression detector + auto-fixer
#
# Takes Playwright screenshots of all dashboard pages at mobile (375px) and desktop
# (1440px) in both light and dark mode on every cycle.
# Compares screenshot file sizes to stored baselines — a >20% change flags a regression.
# When a regression is detected, invokes claude to investigate and fix the layout issue,
# then commits and pushes the fix to main.
#
# Baselines stored in: .clawbot/visual-baselines/
# Logs written to:     .clawbot/logs/visual-qa.log
#
# Usage:
#   scripts/swarm/visual-qa.sh [--interval 300] [--dry-run] [--reset-baselines]
#
# Launch in background:
#   tmux new-session -d -s visual-qa 'scripts/swarm/visual-qa.sh'

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
LOG_DIR="$ROOT_DIR/.clawbot/logs"
LOG_FILE="$LOG_DIR/visual-qa.log"
BASELINE_DIR="$ROOT_DIR/.clawbot/visual-baselines"
SCREENSHOTS_DIR="$ROOT_DIR/.clawbot/visual-qa-current"

mkdir -p "$LOG_DIR" "$BASELINE_DIR" "$SCREENSHOTS_DIR"

# ── Args ──────────────────────────────────────────────────────────────────────
INTERVAL=300       # seconds between screenshot cycles
DRY_RUN="false"
RESET_BASELINES="false"
MAX_FIX_ROUNDS=8
FIX_COUNT=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval)        INTERVAL="$2"; shift 2 ;;
    --dry-run)         DRY_RUN="true"; shift ;;
    --reset-baselines) RESET_BASELINES="true"; shift ;;
    -h|--help)
      cat <<USAGE
Usage: scripts/swarm/visual-qa.sh [--interval 300] [--dry-run] [--reset-baselines]

Takes Playwright screenshots of all dashboard pages and detects layout regressions
by comparing screenshot file sizes to stored baselines (>20% delta = regression).
Auto-fixes regressions using claude, then commits and pushes to main.

Options:
  --interval N        Seconds between screenshot cycles (default: 300)
  --dry-run           Report regressions but do not invoke claude or commit
  --reset-baselines   Overwrite all baselines with the current screenshots and exit
USAGE
      exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# ── Constants ─────────────────────────────────────────────────────────────────
DEV_SERVER_URL="http://localhost:3000"

# Pages to screenshot — one per dashboard role
PAGES=(
  "/dashboard/student"
  "/dashboard/sponsor"
  "/dashboard/university"
  "/dashboard/admin"
  "/dashboard/agent"
  "/dashboard/partner"
)

# Viewports: "label:width:height"
VIEWPORTS=(
  "mobile:375:812"
  "desktop:1440:900"
)

# Modes
MODES=("light" "dark")

# Regression threshold: percentage change in file size that triggers a flag
REGRESSION_THRESHOLD=20

# ── Helpers ───────────────────────────────────────────────────────────────────
log() {
  echo "[visual-qa] $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"
}

# Derive a safe filename from page + viewport label + mode
# e.g. screenshot_key "/dashboard/student" "mobile" "dark" → dashboard-student_mobile_dark
screenshot_key() {
  local page="$1"
  local viewport_label="$2"
  local mode="$3"
  # Strip leading slash, replace remaining slashes with hyphens
  local slug="${page#/}"
  slug="${slug//\//-}"
  echo "${slug}_${viewport_label}_${mode}"
}

# Returns 0 if dev server is reachable
dev_server_running() {
  curl -s --max-time 3 --head "$DEV_SERVER_URL" >/dev/null 2>&1
}

# Returns absolute value of integer
abs() {
  local n="$1"
  echo "${n#-}"
}

# Compute integer percentage change: ((new - old) / old) * 100
# Prints signed integer
size_delta_percent() {
  local old_size="$1"
  local new_size="$2"
  if [[ "$old_size" -eq 0 ]]; then
    echo "100"
    return
  fi
  # Use awk for float division; print rounded integer
  awk "BEGIN { printf \"%d\", (($new_size - $old_size) / $old_size) * 100 }"
}

# ── Sanity checks ─────────────────────────────────────────────────────────────
if ! command -v claude >/dev/null 2>&1; then
  log "ERROR: claude CLI not found in PATH"
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  log "ERROR: git not found in PATH"
  exit 1
fi

# Check Playwright availability (npx will install if needed, but we at least
# confirm npx itself is present so we fail fast rather than hang)
if ! command -v npx >/dev/null 2>&1; then
  log "ERROR: npx not found — install Node.js first"
  exit 1
fi

if ! npx playwright --version >/dev/null 2>&1; then
  log "ERROR: Playwright not available — run: npx playwright install"
  exit 1
fi

# ── Screenshot function ────────────────────────────────────────────────────────
# Takes a single screenshot via Playwright CLI.
# Args: page_path viewport_width viewport_height mode output_path
take_screenshot() {
  local page="$1"
  local width="$2"
  local height="$3"
  local mode="$4"
  local output="$5"

  # Build color-scheme arg for dark mode
  local color_scheme_arg=""
  if [[ "$mode" == "dark" ]]; then
    color_scheme_arg="--color-scheme=dark"
  fi

  # Playwright CLI screenshot command.
  # --wait-for-timeout gives the page JS time to hydrate before capture.
  npx playwright screenshot \
    --viewport-size="${width},${height}" \
    ${color_scheme_arg} \
    --wait-for-timeout=2000 \
    --full-page \
    "${DEV_SERVER_URL}${page}" \
    "$output" \
    >/dev/null 2>&1
}

# ── Reset baselines ────────────────────────────────────────────────────────────
reset_baselines() {
  log "Resetting all baselines..."

  if ! dev_server_running; then
    log "ERROR: Dev server not running at $DEV_SERVER_URL — cannot reset baselines."
    exit 1
  fi

  local count=0
  for page in "${PAGES[@]}"; do
    for vp_spec in "${VIEWPORTS[@]}"; do
      local label="${vp_spec%%:*}"
      local dims="${vp_spec#*:}"
      local width="${dims%%:*}"
      local height="${dims##*:}"
      for mode in "${MODES[@]}"; do
        local key
        key="$(screenshot_key "$page" "$label" "$mode")"
        local baseline_path="$BASELINE_DIR/${key}.png"
        log "  Capturing baseline: $key"
        take_screenshot "$page" "$width" "$height" "$mode" "$baseline_path" || {
          log "  WARNING: screenshot failed for $key — skipping"
          continue
        }
        count=$((count + 1))
      done
    done
  done

  log "Baselines reset. $count screenshots saved to $BASELINE_DIR"
}

# ── Fix prompt builder ─────────────────────────────────────────────────────────
build_fix_prompt() {
  local regressions="$1"
  cat <<PROMPT
Visual QA detected layout regressions on the Doculet V6 dashboard.
Screenshot file sizes changed by more than ${REGRESSION_THRESHOLD}% vs the stored baselines,
which is a reliable heuristic for collapsed layouts, missing content, color token failures,
or broken responsive behaviour.

REGRESSIONS DETECTED:
$regressions

For each regression above, do the following:
1. Open the relevant page source file under src/app/dashboard/[role]/
2. Run: git log --oneline -10  — to see what recently changed
3. Look for: overflow issues, collapsed flex/grid containers, wrong dark-mode color tokens,
   missing responsive classes (sm: / md: / lg:), or broken imports
4. Fix the root cause — do NOT just suppress the visual difference
5. After ALL fixes are applied, verify each page by running:
   npx playwright screenshot --viewport-size='375,812' http://localhost:3000[PAGE]
   npx playwright screenshot --viewport-size='1440,900' http://localhost:3000[PAGE]
   (Confirm screenshots look correct by checking the output file size is close to baseline)
6. Commit ALL fixes in one commit:
   git add <specific changed files>
   git commit -m "fix(layout): resolve visual regressions detected by visual-qa [visual-qa]"

IMPORTANT CONSTRAINTS:
- Mobile-first (375px) is MANDATORY — default styles must work at 375px, use sm:/md: for larger
- No horizontal scroll — ever. If content overflows, it is a bug.
- Semantic color tokens ONLY — never bg-white, bg-black, text-gray-* etc.
- Dark mode: dark: variants must be present on every surface that uses a light-mode default
- Touch targets: minimum 44x44px (h-11 min-h-[44px])
- Do not change unrelated files — minimal impact only
PROMPT
}

# ── Screenshot + compare cycle ─────────────────────────────────────────────────
run_qa_cycle() {
  local regressions=""

  for page in "${PAGES[@]}"; do
    for vp_spec in "${VIEWPORTS[@]}"; do
      local label="${vp_spec%%:*}"
      local dims="${vp_spec#*:}"
      local width="${dims%%:*}"
      local height="${dims##*:}"

      for mode in "${MODES[@]}"; do
        local key
        key="$(screenshot_key "$page" "$label" "$mode")"
        local current_path="$SCREENSHOTS_DIR/${key}.png"
        local baseline_path="$BASELINE_DIR/${key}.png"

        log "  Screenshotting ${page} @ ${width}px ${mode}..."

        # Take screenshot — on failure, warn and skip (don't crash the daemon)
        if ! take_screenshot "$page" "$width" "$height" "$mode" "$current_path"; then
          log "  WARNING: screenshot failed for $key — skipping comparison"
          continue
        fi

        # If no baseline exists, promote current as baseline
        if [[ ! -f "$baseline_path" ]]; then
          log "  No baseline for $key — promoting current as baseline"
          cp "$current_path" "$baseline_path"
          continue
        fi

        # Compare by file size
        local old_size
        local new_size
        old_size="$(wc -c < "$baseline_path" | tr -d ' ')"
        new_size="$(wc -c < "$current_path" | tr -d ' ')"

        local delta
        delta="$(size_delta_percent "$old_size" "$new_size")"
        local abs_delta
        abs_delta="$(abs "$delta")"

        if [[ "$abs_delta" -gt "$REGRESSION_THRESHOLD" ]]; then
          log "  REGRESSION: $key size changed ${delta}% (${old_size}B → ${new_size}B)"
          regressions+="- Page: ${page}, Viewport: ${width}px (${label}), Mode: ${mode}"$'\n'
          regressions+="  Size delta: ${delta}% (baseline: ${old_size} bytes, current: ${new_size} bytes)"$'\n'
          regressions+="  Fix prompt template:"$'\n'
          regressions+="  Visual QA detected a layout regression on ${page} at ${width}px in ${mode} mode."$'\n'
          regressions+="  The screenshot size changed by ${delta}% from the baseline."$'\n'
          regressions+="  Common causes: overflow, collapsed flex/grid, wrong color tokens in dark mode,"$'\n'
          regressions+="  missing responsive classes."$'\n'
          regressions+="  Verify with: npx playwright screenshot --viewport-size='${width},${height}' ${DEV_SERVER_URL}${page}"$'\n'
          regressions+=""$'\n'
        else
          log "  OK: $key (delta: ${delta}%)"
        fi
      done
    done
  done

  echo "$regressions"
}

# ── Push helper ───────────────────────────────────────────────────────────────
push_with_retry() {
  git -C "$ROOT_DIR" push origin main >>"$LOG_FILE" 2>&1 || {
    log "Push failed — pulling and retrying."
    git -C "$ROOT_DIR" pull --rebase origin main >>"$LOG_FILE" 2>&1 || true
    git -C "$ROOT_DIR" push origin main >>"$LOG_FILE" 2>&1 || \
      log "ERROR: push failed again. Manual push required."
  }
}

# ── Reset baselines mode ───────────────────────────────────────────────────────
if [[ "$RESET_BASELINES" == "true" ]]; then
  reset_baselines
  exit 0
fi

# ── Main loop ─────────────────────────────────────────────────────────────────
log "Visual-QA started. Interval: ${INTERVAL}s, threshold: ${REGRESSION_THRESHOLD}%"
log "Baselines: $BASELINE_DIR"
log "Pages: ${PAGES[*]}"

while true; do
  # Sync to latest main
  git -C "$ROOT_DIR" pull --rebase origin main >>"$LOG_FILE" 2>&1 || true

  # Skip entirely if dev server is not running — do not crash
  if ! dev_server_running; then
    log "Dev server not running at $DEV_SERVER_URL — skipping this cycle."
    sleep "$INTERVAL"
    continue
  fi

  log "Dev server up. Starting screenshot cycle..."
  REGRESSIONS="$(run_qa_cycle)"

  if [[ -z "$REGRESSIONS" ]]; then
    log "All pages passed visual QA. No regressions detected."
    FIX_COUNT=0
    sleep "$INTERVAL"
    continue
  fi

  REGRESSION_COUNT="$(echo "$REGRESSIONS" | grep -c '^- Page:' || echo 0)"
  log "Detected $REGRESSION_COUNT regression(s)."

  # Write regression report
  REPORT_FILE="$LOG_DIR/last-visual-regressions.txt"
  echo "$REGRESSIONS" > "$REPORT_FILE"
  log "Regression report: $REPORT_FILE"

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN — skipping auto-fix."
    echo "=== VISUAL REGRESSIONS ===" >&2
    echo "$REGRESSIONS" >&2
    sleep "$INTERVAL"
    continue
  fi

  if [[ "$FIX_COUNT" -ge "$MAX_FIX_ROUNDS" ]]; then
    log "ERROR: Reached max fix rounds ($MAX_FIX_ROUNDS). Stopping to prevent infinite loop."
    log "Manual intervention required. Last report: $REPORT_FILE"
    break
  fi

  FIX_COUNT=$((FIX_COUNT + 1))
  log "Invoking claude to fix regressions (round $FIX_COUNT of max $MAX_FIX_ROUNDS)..."

  FIX_PROMPT="$(build_fix_prompt "$REGRESSIONS")"

  unset CLAUDECODE
  cd "$ROOT_DIR"
  claude \
    --model claude-sonnet-4-6 \
    --dangerously-skip-permissions \
    -p "$FIX_PROMPT" \
    >>"$LOG_FILE" 2>&1 || log "claude exited non-zero. Continuing watch loop."

  if git -C "$ROOT_DIR" diff --quiet HEAD 2>/dev/null; then
    log "No changes committed by auto-fixer. Regressions may require manual resolution."
  else
    log "Auto-fix committed changes. Pushing to main..."
    push_with_retry
    log "Fixes pushed. Updating baselines with post-fix screenshots..."

    # Update baselines to reflect the fixed state so the next cycle starts clean
    for page in "${PAGES[@]}"; do
      for vp_spec in "${VIEWPORTS[@]}"; do
        local label="${vp_spec%%:*}"
        local dims="${vp_spec#*:}"
        local width="${dims%%:*}"
        local height="${dims##*:}"
        for mode in "${MODES[@]}"; do
          local key
          key="$(screenshot_key "$page" "$label" "$mode")"
          local baseline_path="$BASELINE_DIR/${key}.png"
          take_screenshot "$page" "$width" "$height" "$mode" "$baseline_path" || true
        done
      done
    done

    log "Baselines updated. FIX_COUNT reset."
    FIX_COUNT=0
  fi

  sleep "$INTERVAL"
done

log "Visual-QA exiting."
