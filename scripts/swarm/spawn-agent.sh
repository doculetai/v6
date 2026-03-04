#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
TASK_FILE="$ROOT_DIR/.clawbot/active-tasks.json"
LOG_DIR="$ROOT_DIR/.clawbot/logs"
WORKTREES_DIR="$ROOT_DIR/.worktrees"
PROMPTS_DIR="$ROOT_DIR/.clawbot/prompts"
RUNNERS_DIR="$ROOT_DIR/.clawbot/runners"

mkdir -p "$LOG_DIR" "$WORKTREES_DIR" "$PROMPTS_DIR" "$RUNNERS_DIR"

usage() {
  cat <<USAGE
Usage:
  scripts/swarm/spawn-agent.sh \
    --id <task-id> \
    --description <text> \
    --agent <codex|claude|openclaw> \
    --message <prompt text> \
    [--branch <branch>] \
    [--base <rev>] \
    [--model <model>] \
    [--effort <low|medium|high>] \
    [--install] \
    [--notify]
USAGE
}

TASK_ID=""
DESCRIPTION=""
AGENT=""
MESSAGE=""
BRANCH=""
BASE_REF="origin/main"
MODEL=""
EFFORT="high"
DO_INSTALL="false"
NOTIFY="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --id) TASK_ID="$2"; shift 2 ;;
    --description) DESCRIPTION="$2"; shift 2 ;;
    --agent) AGENT="$2"; shift 2 ;;
    --message) MESSAGE="$2"; shift 2 ;;
    --branch) BRANCH="$2"; shift 2 ;;
    --base) BASE_REF="$2"; shift 2 ;;
    --model) MODEL="$2"; shift 2 ;;
    --effort) EFFORT="$2"; shift 2 ;;
    --install) DO_INSTALL="true"; shift ;;
    --notify) NOTIFY="true"; shift ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$TASK_ID" || -z "$DESCRIPTION" || -z "$AGENT" || -z "$MESSAGE" ]]; then
  echo "Missing required arguments" >&2
  usage
  exit 1
fi

if [[ -z "$BRANCH" ]]; then
  BRANCH="feat-$TASK_ID"
fi

WORKTREE_PATH="$WORKTREES_DIR/$TASK_ID"
SESSION_NAME="${AGENT}-${TASK_ID}"
SESSION_NAME="${SESSION_NAME//\//-}"
SESSION_NAME="${SESSION_NAME// /-}"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required" >&2
  exit 1
fi

if [[ "$AGENT" == "codex" ]] && ! command -v codex >/dev/null 2>&1; then
  echo "codex command not found" >&2
  exit 1
fi
if [[ "$AGENT" == "claude" ]] && ! command -v claude >/dev/null 2>&1; then
  echo "claude command not found" >&2
  exit 1
fi
if [[ "$AGENT" == "openclaw" ]] && ! command -v openclaw >/dev/null 2>&1; then
  echo "openclaw command not found" >&2
  exit 1
fi

if [[ ! -d "$WORKTREE_PATH/.git" && ! -f "$WORKTREE_PATH/.git" ]]; then
  if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
    BASE_REF="main"
  fi
  if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    git worktree add "$WORKTREE_PATH" "$BRANCH" || {
      ALT_BRANCH="${BRANCH//\//-}"
      git worktree add "$WORKTREE_PATH" "$ALT_BRANCH"
      BRANCH="$ALT_BRANCH"
    }
  else
    git worktree add "$WORKTREE_PATH" -b "$BRANCH" "$BASE_REF" || {
      ALT_BRANCH="${BRANCH//\//-}"
      git worktree add "$WORKTREE_PATH" -b "$ALT_BRANCH" "$BASE_REF"
      BRANCH="$ALT_BRANCH"
    }
  fi
fi

if [[ "$DO_INSTALL" == "true" && -f "$WORKTREE_PATH/package.json" ]]; then
  (cd "$WORKTREE_PATH" && npm install)
fi

PROMPT_FILE="$PROMPTS_DIR/$SESSION_NAME.txt"
RUNNER_FILE="$RUNNERS_DIR/$SESSION_NAME.sh"
printf '%s\n' "$MESSAGE" > "$PROMPT_FILE"

if [[ -z "$MODEL" ]]; then
  case "$AGENT" in
    codex) MODEL="gpt-5.3-codex" ;;
    claude) MODEL="claude-sonnet-4-6" ;;
    openclaw) MODEL="groq/qwen/qwen3-32b" ;;
    *)
      echo "Unsupported agent: $AGENT" >&2
      exit 1
      ;;
  esac
fi

cat > "$RUNNER_FILE" <<RUNNER
#!/bin/zsh
set -euo pipefail
cd "$WORKTREE_PATH"
PROMPT_FILE="$PROMPT_FILE"
case "$AGENT" in
  codex)
    exec codex --model "$MODEL" -c "model_reasoning_effort=$EFFORT" "\$(cat "\$PROMPT_FILE")"
    ;;
  claude)
    exec claude --model "$MODEL" -p "\$(cat "\$PROMPT_FILE")"
    ;;
  openclaw)
    exec openclaw agent --agent v6-factory --message "\$(cat "\$PROMPT_FILE")"
    ;;
  *)
    echo "Unsupported agent: $AGENT" >&2
    exit 1
    ;;
esac
RUNNER
chmod +x "$RUNNER_FILE"

LOG_FILE="$LOG_DIR/$SESSION_NAME.log"
LAUNCH_MODE="nohup"
PID_VALUE=""

if command -v tmux >/dev/null 2>&1; then
  LAUNCH_MODE="tmux"
  tmux new-session -d -s "$SESSION_NAME" -c "$WORKTREE_PATH" "$RUNNER_FILE"
else
  nohup /bin/zsh -lc "$RUNNER_FILE" >"$LOG_FILE" 2>&1 &
  PID_VALUE="$!"
fi

if [[ ! -f "$TASK_FILE" ]]; then
  echo '{"tasks":[]}' > "$TASK_FILE"
fi

NOW_MS="$(node -e 'console.log(Date.now())')"
node - "$TASK_FILE" "$TASK_ID" "$SESSION_NAME" "$AGENT" "$DESCRIPTION" "$ROOT_DIR" "$WORKTREE_PATH" "$BRANCH" "$NOW_MS" "$LAUNCH_MODE" "$PID_VALUE" "$NOTIFY" "$MODEL" "$MESSAGE" "$RUNNER_FILE" <<'NODE'
const fs = require("fs");
const [taskFile, id, session, agent, description, repo, worktree, branch, startedAt, launchMode, pid, notify, model, message, runner] = process.argv.slice(2);
const raw = fs.readFileSync(taskFile, "utf8");
const parsed = JSON.parse(raw);
const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
const existingIndex = tasks.findIndex((t) => t.id === id);
const task = {
  id,
  tmuxSession: session,
  agent,
  description,
  repo,
  worktree,
  branch,
  startedAt: Number(startedAt),
  status: "running",
  notifyOnComplete: notify === "true",
  model,
  message,
  launchMode,
  runner,
  pid: pid ? Number(pid) : null,
  retries: 0,
  maxRetries: 3,
  completedAt: null,
  pr: null,
  lastCommitAt: null,
  checks: {
    prCreated: false,
    ciPassed: false
  }
};
if (existingIndex >= 0) {
  tasks[existingIndex] = task;
} else {
  tasks.push(task);
}
fs.writeFileSync(taskFile, JSON.stringify({ tasks }, null, 2) + "\n");
NODE

echo "Spawned task '$TASK_ID'"
echo "  Agent: $AGENT"
echo "  Worktree: $WORKTREE_PATH"
echo "  Branch: $BRANCH"
if [[ "$LAUNCH_MODE" == "tmux" ]]; then
  echo "  Session: $SESSION_NAME"
else
  echo "  PID: $PID_VALUE"
  echo "  Log: $LOG_FILE"
fi
