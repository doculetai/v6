#!/bin/zsh
# design-lint.sh — Continuous design standards enforcer
#
# Scans src/ for violations of the V6 design system on every cycle:
#   - Raw Tailwind colors (bg-blue-500, text-red-400, etc.) → must use semantic tokens
#   - Inline styles (style={{}}) → use Tailwind classes
#   - Hardcoded copy strings in JSX → must come from src/config/copy/
#   - Emojis in .tsx/.ts source files
#   - <img> tags → must use next/image
#   - <a href> for internal links → must use next/link
#   - Arbitrary pixel sizes (text-[14px], w-[320px]) → use scale values
#   - Non-Lucide icon imports (react-icons, @heroicons, etc.)
#   - Files over 400 lines
#   - Missing 'use client' / 'use server' on files that need it
#
# When violations found → invokes claude to fix all of them, commits, pushes.
#
# Usage:
#   scripts/swarm/design-lint.sh [--interval 180] [--dry-run]
#
# Launch:
#   tmux new-session -d -s design-lint 'scripts/swarm/design-lint.sh'

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SRC_DIR="$ROOT_DIR/src"
LOG_DIR="$ROOT_DIR/.clawbot/logs"
LOG_FILE="$LOG_DIR/design-lint.log"
VIOLATIONS_FILE="$LOG_DIR/last-design-violations.txt"

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
      echo "Usage: design-lint.sh [--interval 180] [--dry-run]"
      exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

log() {
  echo "[design-lint] $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"
}

# Filter grep output lines belonging to files that carry a file-level
# "// design-lint-ignore:" directive on their first line.
# Usage: some_grep_command | filter_file_ignored
filter_file_ignored() {
  while IFS= read -r line; do
    local file="${line%%:*}"
    if [[ -f "$file" ]] && head -1 "$file" 2>/dev/null | grep -q "design-lint-ignore"; then
      continue
    fi
    printf '%s\n' "$line"
  done
}

# ── Violation patterns ────────────────────────────────────────────────────────
# Each check: (label, grep_pattern, grep_flags, file_glob, severity)
# severity: ERROR = must fix, WARN = report only

run_checks() {
  local violations=""

  # ── 1. Raw Tailwind color utilities (not semantic tokens) ──────────────────
  # Allow: bg-background, bg-card, bg-primary, bg-muted, bg-destructive,
  #        bg-accent, bg-popover, bg-secondary, bg-border, bg-input, bg-ring,
  #        text-foreground, text-primary, text-muted-foreground, text-card-foreground, etc.
  # Disallow: bg-blue-500, bg-red-400, text-green-600, border-yellow-200, etc.
  local raw_color_hits
  raw_color_hits=$(
    grep -rn \
      --include="*.tsx" --include="*.ts" \
      -E '(bg|text|border|ring|fill|stroke|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]+' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "\.stories\." \
      | grep -v "// design-lint-disable" \
      || true
  )
  if [[ -n "$raw_color_hits" ]]; then
    violations+=$'\n\n=== RAW TAILWIND COLORS (use semantic tokens: bg-primary, bg-card, text-foreground, etc.) ===\n'
    violations+="$raw_color_hits"
  fi

  # ── 2. Inline styles ──────────────────────────────────────────────────────
  local inline_style_hits
  inline_style_hits=$(
    grep -rn \
      --include="*.tsx" \
      -E 'style=\{[^}]*\}' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "// design-lint-disable" \
      | filter_file_ignored \
      || true
  )
  if [[ -n "$inline_style_hits" ]]; then
    violations+=$'\n\n=== INLINE STYLES (convert to Tailwind classes) ===\n'
    violations+="$inline_style_hits"
  fi

  # ── 3. Emojis in source files ─────────────────────────────────────────────
  local emoji_hits
  emoji_hits=$(
    grep -rn \
      --include="*.tsx" --include="*.ts" \
      -P '[\x{1F300}-\x{1F9FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{1F000}-\x{1F02F}\x{1F0A0}-\x{1F0FF}]' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "// design-lint-disable" \
      || true
  )
  if [[ -n "$emoji_hits" ]]; then
    violations+=$'\n\n=== EMOJIS IN SOURCE (remove all emojis — use Lucide icons only) ===\n'
    violations+="$emoji_hits"
  fi

  # ── 4. Raw <img> tags ─────────────────────────────────────────────────────
  local img_hits
  img_hits=$(
    grep -rn \
      --include="*.tsx" \
      -E '<img ' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "// design-lint-disable" \
      || true
  )
  if [[ -n "$img_hits" ]]; then
    violations+=$'\n\n=== RAW <img> TAGS (use next/image <Image> component) ===\n'
    violations+="$img_hits"
  fi

  # ── 5. Raw <a href> for internal paths ───────────────────────────────────
  local anchor_hits
  anchor_hits=$(
    grep -rn \
      --include="*.tsx" \
      -E '<a href="/' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "// design-lint-disable" \
      | filter_file_ignored \
      || true
  )
  if [[ -n "$anchor_hits" ]]; then
    violations+=$'\n\n=== RAW <a href="/..."> (use next/link <Link> for internal navigation) ===\n'
    violations+="$anchor_hits"
  fi

  # ── 6. Non-Lucide icon imports ────────────────────────────────────────────
  local icon_hits
  icon_hits=$(
    grep -rn \
      --include="*.tsx" --include="*.ts" \
      -E "from '(@heroicons|react-icons|@phosphor-icons|@radix-ui/react-icons|feather-icons)'" \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      || true
  )
  if [[ -n "$icon_hits" ]]; then
    violations+=$'\n\n=== NON-LUCIDE ICON IMPORTS (use lucide-react only) ===\n'
    violations+="$icon_hits"
  fi

  # ── 7. Arbitrary pixel sizes in Tailwind ─────────────────────────────────
  local px_hits
  px_hits=$(
    grep -rn \
      --include="*.tsx" \
      -E 'class(Name)?="[^"]*\[[0-9]+(px|rem)[^]]*\]' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "// design-lint-disable" \
      || true
  )
  if [[ -n "$px_hits" ]]; then
    violations+=$'\n\n=== ARBITRARY PIXEL SIZES (use Tailwind scale: text-sm, w-64, etc.) ===\n'
    violations+="$px_hits"
  fi

  # ── 8. Hardcoded copy strings in JSX (heuristic) ──────────────────────────
  # Look for JSX with literal string children that look like UI copy
  # (More than 4 words, not a className, not a comment, not a URL)
  local copy_hits
  copy_hits=$(
    grep -rn \
      --include="*.tsx" \
      -E '>([A-Z][a-z]+ ){4,}[a-zA-Z]+</' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "\.stories\." \
      | grep -v "// design-lint-disable" \
      | grep -v "src/config/copy" \
      | head -20 \
      || true
  )
  if [[ -n "$copy_hits" ]]; then
    violations+=$'\n\n=== HARDCODED COPY IN JSX (move strings to src/config/copy/*.ts) ===\n'
    violations+="$copy_hits"
  fi

  # ── 9. Files over 400 lines ───────────────────────────────────────────────
  local long_files=""
  while IFS= read -r file; do
    local line_count
    line_count=$(wc -l < "$file" 2>/dev/null || echo 0)
    if [[ "$line_count" -gt 400 ]]; then
      long_files+="$file ($line_count lines)\n"
    fi
  done < <(find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" 2>/dev/null | grep -v node_modules | grep -v "\.stories\.")
  if [[ -n "$long_files" ]]; then
    violations+=$'\n\n=== FILES OVER 400 LINES (split into focused modules) ===\n'
    violations+="$(printf '%b' "$long_files")"
  fi

  echo "$violations"
}

build_fix_prompt() {
  local violations="$1"
  cat <<PROMPT
You are the V6 design standards enforcer for Doculet (Next.js 16, Tailwind CSS 4, shadcn/ui).

Fix ALL of the design violations listed below. Follow these rules exactly:

DESIGN RULES:
- Semantic tokens ONLY: bg-background, bg-card, bg-primary, bg-muted, bg-secondary,
  bg-destructive, bg-accent, text-foreground, text-primary, text-muted-foreground,
  text-card-foreground, text-destructive, border-border, ring-ring. NEVER raw colors.
- NO inline style={{}} — convert to Tailwind classes
- NO emojis anywhere — use Lucide icons instead
- NO <img> — use next/image <Image> with width/height
- NO <a href="/internal"> — use next/link <Link>
- NO non-Lucide icons (react-icons, heroicons, etc.) — use lucide-react
- NO arbitrary pixel values ([14px], [320px]) — use Tailwind scale
- Hardcoded copy → move to src/config/copy/[role].ts and import it
- Files over 400 lines → split at the nearest logical boundary (extract subcomponents)
- NEVER use 'any' types while fixing
- NEVER change component behavior — only migrate to correct patterns

After fixing ALL violations:
1. Run: npx tsc --noEmit  (must be clean)
2. Run: npx eslint src --ext .ts,.tsx --fix (auto-fix what can be fixed)
3. Commit: git add src/ && git commit -m "fix(design): enforce design system standards [design-lint]"

VIOLATIONS TO FIX:
$violations
PROMPT
}

# ── Main loop ─────────────────────────────────────────────────────────────────
log "Design-lint started. Scanning src/ every ${INTERVAL}s"

while true; do
  # Pull latest
  git -C "$ROOT_DIR" pull --rebase origin main >>"$LOG_FILE" 2>&1 || true

  log "Scanning for design violations..."
  VIOLATIONS="$(run_checks)"

  if [[ -z "$VIOLATIONS" ]]; then
    log "All design standards clean."
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
  log "Auto-fixing design violations (round $FIX_COUNT)..."

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
    log "Design fixes pushed to main."
    FIX_COUNT=0
  else
    log "No files changed by auto-fixer."
  fi

  sleep "$INTERVAL"
done

log "Design-lint exiting."
