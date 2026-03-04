#!/bin/zsh
# a11y-watch.sh — Continuous accessibility violation scanner + auto-fixer
#
# Scans all .tsx files in src/ for common WCAG 2.1 AA accessibility violations
# using grep-based static analysis (no external tools required).
#
# Checks:
#   1. Icon-only buttons missing aria-label
#   2. Page files (page.tsx) missing an h1 heading
#   3. <Image> components missing alt prop
#   4. <Input>/<input> fields missing associated label or aria-label
#   5. Links with only icon children and no aria-label or sr-only span
#   6. Low-contrast hardcoded color combinations
#   7. Touch targets too small (h-6 w-6 or smaller — minimum is h-11 / 44px)
#
# When violations found → invokes claude to fix all of them, commits, pushes.
#
# Logs written to: .clawbot/logs/a11y-watch.log
#
# Usage:
#   scripts/swarm/a11y-watch.sh [--interval 240] [--dry-run]
#
# Launch in background:
#   tmux new-session -d -s a11y-watch 'scripts/swarm/a11y-watch.sh'

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SRC_DIR="$ROOT_DIR/src"
LOG_DIR="$ROOT_DIR/.clawbot/logs"
LOG_FILE="$LOG_DIR/a11y-watch.log"
VIOLATIONS_FILE="$LOG_DIR/last-a11y-violations.txt"

mkdir -p "$LOG_DIR"

# ── Args ──────────────────────────────────────────────────────────────────────
INTERVAL=240
DRY_RUN="false"
MAX_FIX_ROUNDS=8
FIX_COUNT=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval) INTERVAL="$2"; shift 2 ;;
    --dry-run)  DRY_RUN="true"; shift ;;
    -h|--help)
      cat <<USAGE
Usage: scripts/swarm/a11y-watch.sh [--interval 240] [--dry-run]

Scans src/ for WCAG 2.1 AA accessibility violations using static grep analysis.
Auto-fixes violations using claude, then commits and pushes to main.

Options:
  --interval N    Seconds between scans (default: 240)
  --dry-run       Report violations but do not auto-fix or commit
USAGE
      exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# ── Sanity checks ─────────────────────────────────────────────────────────────
if ! command -v claude >/dev/null 2>&1; then
  log "ERROR: claude CLI not found in PATH"
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  log "ERROR: git not found in PATH"
  exit 1
fi

# ── Helpers ───────────────────────────────────────────────────────────────────
log() {
  echo "[a11y-watch] $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"
}

# ── Checks ────────────────────────────────────────────────────────────────────
run_checks() {
  local violations=""

  # ── 1. Icon-only buttons missing aria-label ──────────────────────────────
  # Heuristic: a <Button that contains a Lucide icon import name (e.g. <Search,
  # <Menu, <X, <ChevronRight) but does NOT have aria-label= or an sr-only span.
  # We look for JSX <Button> blocks where the only child content is a single
  # Lucide component (all start with capital letter, no space text children).
  # Strategy: find .tsx files that have a <Button (or <button) containing
  # a Lucide icon usage, then check those files for missing aria-label on them.
  #
  # Practical grep: find lines like <Button> or <Button className="..."> that
  # are immediately followed (within the same block) by a Lucide icon and lack
  # aria-label. We flag files where <Button[^>]*> lines have no aria-label and
  # the sibling content is only icons (no visible text between tags).
  #
  # We use a two-pass approach: first find candidate files, then check inside them.
  local icon_button_hits
  icon_button_hits=$(
    # Find Button usages that contain a Lucide icon but no accessible text.
    # Pattern: <Button or <button followed by no text content — only Lucide icons,
    # and no aria-label on the element.
    # This grep catches: <Button><Search className=... /></Button> without aria-label
    grep -rn \
      --include="*.tsx" \
      -P '<[Bb]utton(?![^>]*aria-label)[^>]*>\s*<[A-Z][a-zA-Z]+\s+[^>]*className[^>]*/>' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "\.stories\." \
      | grep -v "// a11y-disable" \
      || true
  )
  # Second pass: catch single-line <Button ...><IconName .../></Button> without aria-label
  local icon_button_hits2
  icon_button_hits2=$(
    grep -rn \
      --include="*.tsx" \
      -E '<(Button|button)[^>]*><[A-Z][a-zA-Z]+ [^/]*/></(Button|button)>' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "aria-label" \
      | grep -v "sr-only" \
      | grep -v "node_modules" \
      | grep -v "\.stories\." \
      | grep -v "// a11y-disable" \
      || true
  )
  local combined_icon_button="${icon_button_hits}"$'\n'"${icon_button_hits2}"
  # Strip blank lines before checking
  combined_icon_button="$(echo "$combined_icon_button" | grep -v '^[[:space:]]*$' || true)"
  if [[ -n "$combined_icon_button" ]]; then
    violations+=$'\n\n=== CHECK 1: ICON-ONLY BUTTONS MISSING aria-label ===\n'
    violations+="Add aria-label=\"[action description]\" to each <Button> below, OR wrap the icon in a"$'\n'
    violations+='<span className="sr-only">[action description]</span> sibling.'$'\n\n'
    violations+="$combined_icon_button"
  fi

  # ── 2. Page files (page.tsx) missing h1 ─────────────────────────────────
  # Scan every page.tsx under src/. If the file contains no <h1, no role="heading"
  # with aria-level="1", and no PageHeading (common wrapper component), flag it.
  local missing_h1_files=""
  while IFS= read -r page_file; do
    # Skip stories and layout files
    [[ "$page_file" == *".stories."* ]] && continue
    # Check for h1 presence
    if ! grep -qE '(<h1|role="heading".*aria-level="1"|<PageHeading)' "$page_file" 2>/dev/null; then
      missing_h1_files+="${page_file}"$'\n'
    fi
  done < <(find "$SRC_DIR" -name "page.tsx" 2>/dev/null | grep -v node_modules)

  if [[ -n "$missing_h1_files" ]]; then
    violations+=$'\n\n=== CHECK 2: PAGE FILES MISSING <h1> HEADING ===\n'
    violations+="Each page must have exactly one visible <h1> heading for screen reader navigation."$'\n'
    violations+="Add <h1> as the first visible heading, or use your PageHeading component."$'\n\n'
    violations+="$missing_h1_files"
  fi

  # ── 3. <Image> components missing alt prop ───────────────────────────────
  local missing_alt_hits
  missing_alt_hits=$(
    grep -rn \
      --include="*.tsx" \
      -E '<Image[^>]+>' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v 'alt=' \
      | grep -v "node_modules" \
      | grep -v "\.stories\." \
      | grep -v "// a11y-disable" \
      || true
  )
  if [[ -n "$missing_alt_hits" ]]; then
    violations+=$'\n\n=== CHECK 3: <Image> COMPONENTS MISSING alt PROP ===\n'
    violations+='Add alt="" for decorative images, or alt="[description]" for informative images.'$'\n\n'
    violations+="$missing_alt_hits"
  fi

  # ── 4. Form inputs missing labels or aria-label ──────────────────────────
  # Flag <Input or <input that have neither:
  #   - an aria-label= prop
  #   - an aria-labelledby= prop
  #   - a placeholder= (weak, but heuristically present as a last resort)
  # We flag inputs that have NONE of these, which is the most broken case.
  local unlabeled_input_hits
  unlabeled_input_hits=$(
    grep -rn \
      --include="*.tsx" \
      -E '<(Input|input)[^>]*>' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v 'aria-label' \
      | grep -v 'aria-labelledby' \
      | grep -v 'id=' \
      | grep -v 'type="hidden"' \
      | grep -v "node_modules" \
      | grep -v "\.stories\." \
      | grep -v "// a11y-disable" \
      || true
  )
  if [[ -n "$unlabeled_input_hits" ]]; then
    violations+=$'\n\n=== CHECK 4: FORM INPUTS MISSING LABEL OR aria-label ===\n'
    violations+="Each input must be associated with a <label> via htmlFor/id, "
    violations+='or have aria-label="[field name]" directly on the element.'$'\n\n'
    violations+="$unlabeled_input_hits"
  fi

  # ── 5. Links with only icon children and no accessible name ─────────────
  # Find <Link> or <a elements that contain only a Lucide icon (no text,
  # no aria-label, no sr-only span)
  local icon_link_hits
  icon_link_hits=$(
    grep -rn \
      --include="*.tsx" \
      -E '<(Link|a)[^>]*>[[:space:]]*<[A-Z][a-zA-Z]+[[:space:]][^/]*/>[[:space:]]*</(Link|a)>' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v 'aria-label' \
      | grep -v 'sr-only' \
      | grep -v "node_modules" \
      | grep -v "\.stories\." \
      | grep -v "// a11y-disable" \
      || true
  )
  if [[ -n "$icon_link_hits" ]]; then
    violations+=$'\n\n=== CHECK 5: LINKS WITH ONLY ICON CHILDREN — MISSING ACCESSIBLE NAME ===\n'
    violations+='Add aria-label="[destination description]" to each link, OR add '
    violations+='<span className="sr-only">[destination]</span> inside the link.'$'\n\n'
    violations+="$icon_link_hits"
  fi

  # ── 6. Low-contrast hardcoded color combinations ─────────────────────────
  # Look for known low-contrast pairing patterns: light gray text on light gray
  # backgrounds. These are WCAG AA failures (contrast ratio < 4.5:1).
  # Common offenders in Tailwind: text-gray-400 (contrast ~3.1:1 on white),
  # text-gray-300, text-slate-400, text-zinc-400.
  local low_contrast_hits
  low_contrast_hits=$(
    grep -rn \
      --include="*.tsx" \
      -E 'text-(gray|slate|zinc|neutral|stone)-(300|400)' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "\.stories\." \
      | grep -v "// a11y-disable" \
      | grep -v "dark:" \
      | head -30 \
      || true
  )
  if [[ -n "$low_contrast_hits" ]]; then
    violations+=$'\n\n=== CHECK 6: LOW-CONTRAST HARDCODED COLORS ===\n'
    violations+="text-gray-300/400 and equivalents fail WCAG AA contrast requirements on light backgrounds."$'\n'
    violations+="Replace with semantic tokens: text-muted-foreground (passes AA), text-foreground,"$'\n'
    violations+="or text-secondary-foreground. Never hardcode Tailwind gray scale for body text."$'\n\n'
    violations+="$low_contrast_hits"
  fi

  # ── 7. Touch targets too small ───────────────────────────────────────────
  # WCAG 2.2 requires 24x24px minimum; our standard is 44x44px (h-11 / min-h-[44px]).
  # Flag buttons and links with h-6 (24px) or smaller as explicit class values.
  # h-6 = 24px, h-5 = 20px, h-4 = 16px — all too small for touch targets on interactive elements.
  local small_target_hits
  small_target_hits=$(
    grep -rn \
      --include="*.tsx" \
      -E '<(Button|button|Link|a)[^>]*(className|class)="[^"]*\bh-(4|5|6)\b[^"]*"' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "\.stories\." \
      | grep -v "// a11y-disable" \
      || true
  )
  # Also catch w-4, w-5, w-6 when combined with similar heights (icon buttons with no padding)
  local small_target_hits2
  small_target_hits2=$(
    grep -rn \
      --include="*.tsx" \
      -E 'size="(xs|icon)"[^>]*(h-(4|5|6)|w-(4|5|6))' \
      "$SRC_DIR" 2>/dev/null \
      | grep -v "node_modules" \
      | grep -v "\.stories\." \
      | grep -v "// a11y-disable" \
      || true
  )
  local combined_small="${small_target_hits}"$'\n'"${small_target_hits2}"
  combined_small="$(echo "$combined_small" | grep -v '^[[:space:]]*$' || true)"
  if [[ -n "$combined_small" ]]; then
    violations+=$'\n\n=== CHECK 7: TOUCH TARGETS TOO SMALL (minimum 44x44px = h-11) ===\n'
    violations+="Interactive elements with h-4/h-5/h-6 are below the WCAG 2.2 minimum touch target size."$'\n'
    violations+="Use h-11 (44px) or min-h-[44px] for all buttons and links."$'\n'
    violations+="For icon-only buttons: add p-2 to increase hit area without changing the icon size."$'\n\n'
    violations+="$combined_small"
  fi

  echo "$violations"
}

# ── Fix prompt ─────────────────────────────────────────────────────────────────
build_fix_prompt() {
  local violations="$1"
  cat <<PROMPT
You are the V6 accessibility compliance fixer for Doculet (Next.js 16, React 19, WCAG 2.1 AA).

The following accessibility violations were detected in src/ by static analysis.
Fix ALL of them now, following WCAG 2.1 AA requirements exactly.

ACCESSIBILITY RULES:
- CHECK 1 — Icon-only buttons: Add aria-label="[action]" on the <Button>, OR add
  <span className="sr-only">[action]</span> as a sibling to the icon inside the button.
  Example: <Button aria-label="Close dialog"><X className="h-5 w-5" /></Button>

- CHECK 2 — Missing h1: Every page.tsx must have exactly one <h1> as the first visible
  heading. Use the page's main title. Import from copy config if available.
  Example: <h1 className="text-2xl font-semibold text-foreground">{copy.pageTitle}</h1>

- CHECK 3 — Image alt text: Decorative images get alt="". Informative images get a
  concise description. NEVER omit the alt prop entirely.
  Example: <Image src={logo} alt="Doculet company logo" width={120} height={40} />

- CHECK 4 — Form input labels: Add aria-label="[field name]" on the <Input> component,
  OR associate a <label htmlFor="inputId"> with a matching id="inputId" on the input.
  Example: <Input aria-label="Email address" type="email" ... />

- CHECK 5 — Icon-only links: Add aria-label="[destination]" on the <Link>, OR add
  <span className="sr-only">[destination]</span> inside the link.
  Example: <Link href="/settings" aria-label="Account settings"><Settings /></Link>

- CHECK 6 — Low contrast colors: Replace text-gray-300/400 and similar with
  text-muted-foreground (semantic token, designed to pass AA contrast).
  NEVER use raw Tailwind gray scale for body or label text.

- CHECK 7 — Touch targets: Replace h-4/h-5/h-6 on interactive elements with h-11.
  For icon buttons that must stay small visually, add p-2 to expand the hit area:
  <Button variant="ghost" size="icon" className="h-11 w-11 p-2"><Icon className="h-5 w-5" /></Button>

CONSTRAINTS:
- Do NOT change visual appearance beyond what's necessary to fix the violation
- Do NOT add 'any' types while fixing
- Do NOT touch files unrelated to the violations listed
- After ALL violations are fixed:
  1. Run: npx tsc --noEmit  (must be clean)
  2. Run: npx eslint src --ext .ts,.tsx --format compact  (no new errors)
  3. Commit with specific files (do NOT use git add -A):
     git add <list of changed files>
     git commit -m "fix(a11y): resolve accessibility violations [a11y-watch]"

VIOLATIONS TO FIX:
$violations
PROMPT
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

# ── Main loop ─────────────────────────────────────────────────────────────────
log "A11y-watch started. Scanning src/ every ${INTERVAL}s (7 checks, WCAG 2.1 AA)"

while true; do
  # Pull latest
  git -C "$ROOT_DIR" pull --rebase origin main >>"$LOG_FILE" 2>&1 || true

  log "Scanning for accessibility violations..."
  VIOLATIONS="$(run_checks)"

  if [[ -z "$VIOLATIONS" ]]; then
    log "All accessibility checks passed. No violations found."
    FIX_COUNT=0
    sleep "$INTERVAL"
    continue
  fi

  VIOLATION_CATEGORIES="$(echo "$VIOLATIONS" | grep -c '=== CHECK' || echo 0)"
  VIOLATION_LINES="$(echo "$VIOLATIONS" | grep -cE '^[^=].*:[0-9]+:' || echo 0)"
  log "Found $VIOLATION_CATEGORIES check category(ies), approx $VIOLATION_LINES violation line(s)."

  echo "$VIOLATIONS" > "$VIOLATIONS_FILE"
  log "Full report: $VIOLATIONS_FILE"

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN — skipping auto-fix."
    echo "=== A11Y VIOLATIONS ===" >&2
    echo "$VIOLATIONS" >&2
    sleep "$INTERVAL"
    continue
  fi

  if [[ "$FIX_COUNT" -ge "$MAX_FIX_ROUNDS" ]]; then
    log "ERROR: Reached max fix rounds ($MAX_FIX_ROUNDS). Stopping to prevent infinite loop."
    log "Manual intervention required. Last report: $VIOLATIONS_FILE"
    break
  fi

  FIX_COUNT=$((FIX_COUNT + 1))
  log "Invoking claude to fix a11y violations (round $FIX_COUNT of max $MAX_FIX_ROUNDS)..."

  FIX_PROMPT="$(build_fix_prompt "$VIOLATIONS")"

  unset CLAUDECODE
  cd "$ROOT_DIR"
  claude \
    --model claude-sonnet-4-6 \
    --dangerously-skip-permissions \
    -p "$FIX_PROMPT" \
    >>"$LOG_FILE" 2>&1 || log "claude exited non-zero. Continuing watch loop."

  if git -C "$ROOT_DIR" diff --quiet HEAD 2>/dev/null; then
    log "No changes committed by auto-fixer. Violations may require manual resolution."
  else
    log "Auto-fix committed changes. Pushing to main..."
    push_with_retry
    log "A11y fixes pushed. FIX_COUNT reset."
    FIX_COUNT=0
  fi

  sleep "$INTERVAL"
done

log "A11y-watch exiting."
