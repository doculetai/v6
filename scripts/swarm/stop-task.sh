#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
TASK_FILE="$ROOT_DIR/.clawbot/active-tasks.json"
TASK_ID="${1:-}"

if [[ -z "$TASK_ID" ]]; then
  echo "Usage: scripts/swarm/stop-task.sh <task-id>" >&2
  exit 1
fi

if [[ ! -f "$TASK_FILE" ]]; then
  echo "No task registry found"
  exit 0
fi

node - "$TASK_FILE" "$TASK_ID" <<'NODE'
const fs = require("fs");
const { spawnSync } = require("child_process");

const [taskFile, taskId] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(taskFile, "utf8"));
const tasks = Array.isArray(data.tasks) ? data.tasks : [];
const idx = tasks.findIndex((t) => t.id === taskId);
if (idx < 0) {
  console.log(`Task not found: ${taskId}`);
  process.exit(0);
}
const task = tasks[idx];

if (task.launchMode === "tmux" && task.tmuxSession) {
  spawnSync("tmux", ["kill-session", "-t", task.tmuxSession], { stdio: "ignore" });
}
if (task.launchMode === "nohup" && task.pid) {
  spawnSync("kill", [String(task.pid)], { stdio: "ignore" });
}

tasks.splice(idx, 1);
fs.writeFileSync(taskFile, JSON.stringify({ tasks }, null, 2) + "\n");
console.log(`Stopped and removed task: ${taskId}`);
NODE
