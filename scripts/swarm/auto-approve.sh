#!/bin/zsh
# auto-approve.sh — auto-send option "2" (don't ask again) to any tmux session
# that shows a codex approval prompt. Runs in background via launchd or cron.
#
# Usage: ./scripts/swarm/auto-approve.sh [session-pattern]
# Default: approves ALL codex-* sessions

PATTERN="${1:-codex-}"
INTERVAL=3  # seconds between checks

echo "[auto-approve] watching sessions matching: $PATTERN (every ${INTERVAL}s)"
echo "[auto-approve] ctrl+C to stop"

while true; do
  for session in $(tmux list-sessions -F '#{session_name}' 2>/dev/null | grep "$PATTERN"); do
    pane_text=$(tmux capture-pane -t "$session" -p 2>/dev/null)

    # Detect approval prompts (any codex "Would you like" / "Do you want" dialogs)
    if echo "$pane_text" | grep -q "› 1\. Yes, proceed\|› 1\. Yes, and don't ask\|Press enter to confirm"; then
      # Option 2 = "Yes, and don't ask again" — preferred over 1 (always ask)
      if echo "$pane_text" | grep -q "2\. Yes, and don't ask again"; then
        tmux send-keys -t "$session" "2" Enter 2>/dev/null
        echo "[auto-approve] $session → sent '2' (don't ask again) at $(date '+%H:%M:%S')"
      else
        # No "don't ask again" option — just send "1" (yes)
        tmux send-keys -t "$session" "1" Enter 2>/dev/null
        echo "[auto-approve] $session → sent '1' (yes) at $(date '+%H:%M:%S')"
      fi
    fi
  done
  sleep $INTERVAL
done
