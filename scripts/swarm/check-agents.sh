#!/bin/zsh
# check-agents.sh — Swarm monitor + conductor for V6
# Runs every 10 minutes via cron (install-monitor-cron.sh).
# Safe: all execSync inputs are sourced from plan JSON, not user input at runtime.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
TASK_FILE="$ROOT_DIR/.clawbot/active-tasks.json"
LOG_DIR="$ROOT_DIR/.clawbot/logs"
PLAN_FILE="$ROOT_DIR/docs/plans/master-plan.json"
SPAWN_SCRIPT="$ROOT_DIR/scripts/swarm/spawn-agent.sh"
PROMPTS_DIR="$ROOT_DIR/.clawbot/prompts"

mkdir -p "$LOG_DIR"

if [[ ! -f "$TASK_FILE" ]]; then
  echo "No task registry at $TASK_FILE"
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node is required" >&2
  exit 1
fi

# ─── STATUS CHECK + LAST-COMMIT TRACKING ────────────────────────────────────

TMP_FILE="$(mktemp)"
node - "$TASK_FILE" "$TMP_FILE" <<'NODE'
const fs = require("fs");
const { execSync, spawnSync } = require("child_process");

const [taskFile, outFile] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(taskFile, "utf8"));
const tasks = Array.isArray(data.tasks) ? data.tasks : [];

function run(cmd, cwd) {
  try {
    return execSync(cmd, {
      cwd,
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8"
    }).trim();
  } catch {
    return "";
  }
}

function isPidAlive(pid) {
  if (!pid) return false;
  const result = spawnSync("kill", ["-0", String(pid)]);
  return result.status === 0;
}

function isTmuxAlive(session) {
  if (!session) return false;
  const result = spawnSync("tmux", ["has-session", "-t", session]);
  return result.status === 0;
}

function nowMs() {
  return Date.now();
}

const changes = [];
for (const task of tasks) {
  const repo = task.repo || process.cwd();
  const worktree = task.worktree || repo;
  const branch = task.branch || "";
  let hasOpenPr = false;

  if (branch) {
    const prRaw = run(`gh pr list --head "${branch}" --state all --json number,state,url --limit 1`, repo);
    if (prRaw) {
      try {
        const prs = JSON.parse(prRaw);
        if (Array.isArray(prs) && prs.length > 0) {
          const pr = prs[0];
          task.pr = pr.number;
          task.prUrl = pr.url;
          task.checks = task.checks || {};
          task.checks.prCreated = true;
          hasOpenPr = pr.state === "OPEN";
          if (hasOpenPr) {
            task.status = "awaiting-review";
          }
          if (pr.state === "MERGED") {
            task.status = "done";
            task.completedAt = task.completedAt || nowMs();
            task.checks.ciPassed = true;
            changes.push(`done:${task.id}:pr-${pr.number}`);
          }
        }
      } catch {
        // ignore parse failures
      }
    }
  }

  // Track last commit timestamp in the worktree for idle detection
  if (task.status === "running" || task.status === "awaiting-review") {
    const commitTs = run(`git log --format="%ct" -1`, worktree);
    if (commitTs && !isNaN(Number(commitTs))) {
      task.lastCommitAt = Number(commitTs) * 1000; // unix seconds → ms
    }
  }

  const alive = task.launchMode === "tmux"
    ? isTmuxAlive(task.tmuxSession)
    : isPidAlive(task.pid);

  if (task.status === "running" && !alive && !hasOpenPr) {
    if ((task.retries || 0) < (task.maxRetries || 3)) {
      if (task.launchMode === "nohup" && task.runner) {
        const out = run(
          `nohup /bin/zsh -lc "${task.runner}" > '${repo}/.clawbot/logs/${task.tmuxSession}.log' 2>&1 & echo $!`,
          repo
        );
        task.pid = out ? Number(out) : null;
        task.retries = (task.retries || 0) + 1;
        changes.push(`respawned:${task.id}:retry-${task.retries}`);
      } else {
        task.status = "blocked";
        task.note = "Agent process exited unexpectedly and could not be respawned";
        changes.push(`blocked:${task.id}`);
      }
    } else {
      task.status = "blocked";
      task.note = "Agent process exited and reached max retries";
      changes.push(`blocked:${task.id}:max-retries`);
    }
  }
}

fs.writeFileSync(outFile, JSON.stringify({ tasks }, null, 2) + "\n");
if (changes.length > 0) {
  console.log(changes.join("\n"));
}
NODE

mv "$TMP_FILE" "$TASK_FILE"

echo "Swarm monitor check complete"
node - "$TASK_FILE" <<'NODE'
const fs = require("fs");
const file = process.argv[2];
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const tasks = Array.isArray(data.tasks) ? data.tasks : [];
if (tasks.length === 0) {
  console.log("- no tasks tracked");
  process.exit(0);
}
for (const t of tasks) {
  const line = [
    `- ${t.id}`,
    `status=${t.status}`,
    `agent=${t.agent}`,
    `branch=${t.branch || "-"}`,
    `pr=${t.pr || "-"}`,
    `retries=${t.retries || 0}/${t.maxRetries || 3}`
  ].join(" ");
  console.log(line);
}
NODE

# ─── CONDUCTOR LOGIC ─────────────────────────────────────────────────────────

if [[ ! -f "$PLAN_FILE" ]]; then
  echo "No master plan at $PLAN_FILE — skipping conductor"
  exit 0
fi

echo ""
echo "=== CONDUCTOR ==="

node - "$TASK_FILE" "$PLAN_FILE" "$SPAWN_SCRIPT" "$ROOT_DIR" "$PROMPTS_DIR" <<'NODE'
const fs = require("fs");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const [taskFile, planFile, spawnScript, rootDir, promptsDir] = process.argv.slice(2);

const registryRaw = JSON.parse(fs.readFileSync(taskFile, "utf8"));
const registry = Array.isArray(registryRaw.tasks) ? registryRaw.tasks : [];

const plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
const waves = Array.isArray(plan.waves) ? plan.waves : [];

const IDLE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
const nowMs = Date.now();

// ── Helper: find task in registry by id ──
function findInRegistry(taskId) {
  return registry.find((t) => t.id === taskId) || null;
}

// ── Helper: check if tmux session is alive ──
function isTmuxAlive(session) {
  if (!session) return false;
  return spawnSync("tmux", ["has-session", "-t", session]).status === 0;
}

// ── Helper: derive effective status of a plan task ──
function effectiveStatus(planTask) {
  const reg = findInRegistry(planTask.id);
  if (!reg) return "pending";
  return reg.status; // running | awaiting-review | done | blocked | pending
}

// ── Helper: check if all dependencies of a plan task are done ──
function depsAllDone(planTask) {
  const deps = planTask.dependsOn || [];
  return deps.every((depId) => {
    for (const wave of waves) {
      const found = (wave.tasks || []).find((t) => t.id === depId);
      if (found) return effectiveStatus(found) === "done";
    }
    // dep not in plan — treat as already satisfied (external dep)
    return true;
  });
}

// ── 1. AUTO-NUDGE: idle running sessions ──
for (const reg of registry) {
  if (reg.status !== "running") continue;
  if (reg.launchMode !== "tmux") continue;
  if (!isTmuxAlive(reg.tmuxSession)) continue;

  const lastActivity = reg.lastCommitAt || reg.startedAt || 0;
  const idleMs = nowMs - lastActivity;

  if (idleMs > IDLE_THRESHOLD_MS) {
    const idleMin = Math.round(idleMs / 60000);
    console.log(`[nudge] ${reg.id} idle ${idleMin}m — sending commit prompt`);
    spawnSync(
      "tmux",
      ["send-keys", "-t", reg.tmuxSession, "Commit all changes and open a pull request.", "Enter"],
      { stdio: "ignore" }
    );
  }
}

// ── 2. WAVE STATUS ANALYSIS ──
const waveStatuses = [];
let activeWaveIndex = -1;

for (let wi = 0; wi < waves.length; wi++) {
  const wave = waves[wi];
  const tasks = wave.tasks || [];

  if (tasks.length === 0) {
    waveStatuses.push({
      wave: wave.wave,
      label: wave.name || "",
      total: 0,
      done: 0,
      running: 0,
      pending: 0,
      blocked: 0
    });
    continue;
  }

  const counts = { done: 0, running: 0, "awaiting-review": 0, pending: 0, blocked: 0 };
  for (const t of tasks) {
    const s = effectiveStatus(t);
    counts[s] = (counts[s] || 0) + 1;
  }

  const effectiveRunning = counts.running + counts["awaiting-review"];
  waveStatuses.push({
    wave: wave.wave,
    label: wave.name || "",
    total: tasks.length,
    done: counts.done,
    running: effectiveRunning,
    pending: counts.pending,
    blocked: counts.blocked
  });

  const allDone = tasks.every((t) => effectiveStatus(t) === "done");
  if (!allDone && activeWaveIndex < 0) {
    activeWaveIndex = wi;
  }
}

// ── 3. WAVE ADVANCEMENT: spawn pending tasks in active wave ──
if (activeWaveIndex >= 0) {
  const activeWave = waves[activeWaveIndex];
  const tasksToSpawn = (activeWave.tasks || []).filter((planTask) => {
    if (effectiveStatus(planTask) !== "pending") return false;
    if (!depsAllDone(planTask)) return false;
    return true;
  });

  for (const planTask of tasksToSpawn) {
    // Read prompt from file if it exists, fall back to description
    const promptFilePath = path.join(rootDir, planTask.promptFile || "");
    let promptMessage = planTask.description;
    if (planTask.promptFile && fs.existsSync(promptFilePath)) {
      promptMessage = fs.readFileSync(promptFilePath, "utf8").trim();
    }

    const persona = planTask.persona || "";
    console.log(`[spawn] wave ${activeWave.wave} → ${planTask.id} (agent=${planTask.agent}${persona ? ", persona=" + persona : ""})`);

    // Use execFileSync with an array of args to avoid shell injection
    const spawnArgs = [
      "--id", planTask.id,
      "--description", planTask.description,
      "--agent", planTask.agent || "codex",
      "--message", promptMessage,
      "--effort", planTask.effort || "high"
    ];
    if (persona) {
      spawnArgs.push("--persona", persona);
    }

    try {
      execFileSync("/bin/zsh", [spawnScript, ...spawnArgs], {
        cwd: rootDir,
        stdio: "inherit",
        encoding: "utf8"
      });
    } catch (err) {
      console.error(`[spawn-error] ${planTask.id}: ${err.message}`);
    }
  }
}

// ── 4. WAVE SUMMARY ──
console.log("");
console.log("Wave Progress:");
for (const ws of waveStatuses) {
  if (ws.total === 0) {
    console.log(`  Wave ${ws.wave} (${ws.label}): empty — pending definition`);
    continue;
  }

  const doneStr = `${ws.done}/${ws.total} done`;

  if (ws.done === ws.total) {
    console.log(`  Wave ${ws.wave} (${ws.label}): ${doneStr}`);
  } else if (ws.running > 0) {
    const parts = [`${ws.running}/${ws.total} running`];
    if (ws.pending > 0) parts.push(`${ws.pending}/${ws.total} pending`);
    if (ws.blocked > 0) parts.push(`${ws.blocked}/${ws.total} blocked`);
    console.log(`  Wave ${ws.wave} (${ws.label}): ${parts.join(", ")}`);
  } else if (ws.pending > 0) {
    console.log(`  Wave ${ws.wave} (${ws.label}): pending`);
  } else {
    console.log(`  Wave ${ws.wave} (${ws.label}): ${doneStr}`);
  }
}

// spawn-agent.sh writes to TASK_FILE directly — no extra write needed here.
NODE
