#!/bin/zsh
set -euo pipefail
cd "/Users/gm/v6/.worktrees/admin-users"
PROMPT_FILE="/Users/gm/v6/.clawbot/prompts/openrouter-admin-users.txt"
case "openrouter" in
  codex)
    # --full-auto: workspace-write sandbox, no per-command approval prompts
    exec codex --full-auto --model "minimax/minimax-m2.5" -c "model_reasoning_effort=high" "$(cat "$PROMPT_FILE")"
    ;;
  claude)
    # --dangerously-skip-permissions: no tool-approval prompts — fully autonomous
    unset CLAUDECODE
    exec claude --model "minimax/minimax-m2.5" --dangerously-skip-permissions -p "$(cat "$PROMPT_FILE")"
    ;;
  openclaw)
    exec openclaw agent --agent v6-factory --message "$(cat "$PROMPT_FILE")"
    ;;
  openrouter)
    # OpenAI-compatible API via OpenRouter. Requires OPENROUTER_API_KEY env var.
    # Best for: simple analysis, copy config, stub files (free 4B model = small tasks only).
    exec python3 - "$PROMPT_FILE" "minimax/minimax-m2.5" <<'PY'
import sys, os
from openai import OpenAI
prompt_file, model = sys.argv[1], sys.argv[2]
client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=os.environ["OPENROUTER_API_KEY"])
msg = open(prompt_file).read()
r = client.chat.completions.create(model=model, messages=[{"role":"user","content":msg}], max_tokens=4096)
print(r.choices[0].message.content)
PY
    ;;
  deepseek)
    # DeepSeek API — OpenAI-compatible. Requires DEEPSEEK_API_KEY env var.
    # Models: deepseek-chat (general), deepseek-coder (code tasks), deepseek-reasoner (R1)
    # Pricing: ~./scripts/swarm/spawn-agent.sh.14/M input, ~./scripts/swarm/spawn-agent.sh.28/M output — very cheap for large codebases.
    exec python3 - "$PROMPT_FILE" "minimax/minimax-m2.5" <<'PY'
import sys, os
from openai import OpenAI
prompt_file, model = sys.argv[1], sys.argv[2]
client = OpenAI(base_url="https://api.deepseek.com", api_key=os.environ["DEEPSEEK_API_KEY"])
msg = open(prompt_file).read()
r = client.chat.completions.create(model=model, messages=[{"role":"user","content":msg}], max_tokens=8192)
print(r.choices[0].message.content)
PY
    ;;
  gemini)
    # Google Gemini CLI. Requires GEMINI_API_KEY env var.
    exec gemini --model "minimax/minimax-m2.5" "$(cat "$PROMPT_FILE")"
    ;;
  ollama)
    # Local Ollama — no API key needed, no cost.
    exec ollama run "minimax/minimax-m2.5" "$(cat "$PROMPT_FILE")"
    ;;
  openhands)
    # OpenHands (formerly OpenDevin) — autonomous software engineer.
    # Full tool use: browser, terminal, file editor. Runs headlessly via CLI.
    # Docs: https://docs.all-hands.ai/modules/usage/how-to/headless-mode
    # Install: pip3 install openhands-ai
    exec python3 -m openhands.core.main       --task "$(cat "$PROMPT_FILE")"       --workspace-base "$(pwd)"       --runtime local       --model "minimax/minimax-m2.5"       --max-iterations 50
    ;;
  *)
    echo "Unsupported agent: openrouter" >&2
    exit 1
    ;;
esac
