#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
MONITOR_CMD="cd $ROOT_DIR && /bin/zsh scripts/swarm/check-agents.sh >> /tmp/v6-swarm-monitor.log 2>&1"
CRON_LINE="*/10 * * * * $MONITOR_CMD"

EXISTING="$(crontab -l 2>/dev/null || true)"
if echo "$EXISTING" | grep -F "$MONITOR_CMD" >/dev/null 2>&1; then
  echo "Monitor cron already installed"
  exit 0
fi

{
  if [[ -n "$EXISTING" ]]; then
    echo "$EXISTING"
  fi
  echo "$CRON_LINE"
} | crontab -

echo "Installed swarm monitor cron:"
echo "$CRON_LINE"
