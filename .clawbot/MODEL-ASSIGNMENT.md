# Model Assignment Strategy

## Build Safety Architecture (MANDATORY READING)

### Why build errors happen in a swarm

Agents build in **isolated worktrees** from a base commit. When one agent modifies a
shared file (e.g. exports a new function) and merges to main, other worktrees that
already built against the old base don't know. The next merge can introduce broken
imports — or worse, the merged file references something that was never defined.

### Three-layer defence

```
Layer 1 — PREVENT (contract-first)
  Before launching a wave, define all shared exports and types upfront.
  Any file that multiple agents will import → stub it in main BEFORE agents start.
  Agents inherit the stub; they build against a known contract.

Layer 2 — DETECT + FIX (build-watch daemon)
  scripts/swarm/build-watch.sh runs npx tsc --noEmit every 2 minutes on main.
  When errors appear, it invokes claude --dangerously-skip-permissions to auto-fix.
  Fixes are committed + pushed so worktrees can pull a clean base.

  Launch once when starting a wave:
    tmux new-session -d -s build-watch 'scripts/swarm/build-watch.sh'

  Or with dry-run to just report:
    scripts/swarm/build-watch.sh --dry-run

Layer 3 — GATE (pre-merge typecheck)
  check-agents.sh nudges idle agents to commit + PR.
  Before any wave merges, run:
    npx tsc --noEmit  ← must be clean before merging PRs
  The build-watch daemon keeps main clean so this always passes.
```

### Rule: shared contracts ship before agents start

If MULTIPLE agents will import from the SAME file:
1. Write a complete (or stub) version of that file on main first
2. Then launch agents — they all inherit the same base contract
3. Individual agents only ADD their own exports, never remove shared ones

Example: `src/server/routers/student.ts` — define the router shape on main,
then each sub-feature agent adds its procedures. No merge conflict on shape.

## Available Agents (cost order: free → paid)

| Agent flag | Model | Cost | Context | Best for |
|------------|-------|------|---------|----------|
| `--agent deepseek --model deepseek-reasoner` | DeepSeek R1 (reasoning) | ~$0.55/M | 64k | Complex logic, algorithms, refactoring |
| `--agent deepseek` | DeepSeek Coder | ~$0.14/M | 64k | Code generation, review, TypeScript |
| `--agent deepseek --model deepseek-chat` | DeepSeek Chat | ~$0.14/M | 64k | Copy config, analysis, general tasks |
| `--agent ollama --model qwen2.5-coder:7b` | Local Qwen2.5 7B | FREE | 32k | Simple TS types, small utilities |
| `--agent ollama --model qwen3-coder` | Local Qwen3-Coder 30B | FREE | 16k | Large local analysis |
| `--agent openclaw` | Groq/Qwen3-32B | FREE | 128k | Code review, copy config, analysis |
| `--agent openclaw --model groq/llama-3.3-70b-versatile` | Groq/Llama3.3 70B | FREE | 128k | Complex review tasks |
| `--agent openclaw --model groq/meta-llama/llama-4-scout-17b-16e-instruct` | Groq/Llama4 Scout | FREE | 128k | Fast generation |
| `--agent claude` | Sonnet 4.6 | PAID | 200k | Full builds, backend, complex UI |
| `--agent codex` | GPT-5.3 Codex | PAID | 200k | Full builds (alternative to claude) |

## Task-to-Model Map

### Use `claude` (paid) for:
- Full page builds (page.tsx + *-page-client.tsx + sub-components)
- tRPC procedures and Drizzle queries
- Complex multi-file features
- Any task that needs real file editing + tool use

### Use `openclaw` (FREE) for:
- Copy config files (`src/config/copy/*.ts`)
- Code review after builds (persona: `qa-lead`)
- Code simplification passes (persona: `qa-lead`)
- Navigation config updates (`src/config/nav/*.ts`)
- TypeScript type definitions
- Playwright test stubs (not full E2E, just structure)

### Use `ollama` (FREE) for:
- Offline analysis when internet is down
- Private/sensitive code review
- Quick utility function generation
- Schema type generation from existing DB types

## Standardization

All agents receive the same product context via persona injection:
- `.clawbot/personas/<role>.md` — technical conventions + product context
- `.clawbot/PRODUCT.md` — ground truth product brief

The persona system normalizes output across models. A free Qwen3-32B with the frontend-lead persona follows the same patterns as Claude with that persona.

## Example: Wave build with mixed agents

```bash
# Step 1: Claude builds the pages (complex, needs file editing)
./scripts/swarm/spawn-agent.sh \
  --id sponsor-overview \
  --agent claude \
  --persona frontend-lead \
  --message "Build src/app/dashboard-v2/[role]/sponsor/page.tsx..."

# Step 2: Openclaw generates copy config (free, deterministic)
./scripts/swarm/spawn-agent.sh \
  --id sponsor-copy \
  --agent openclaw \
  --persona frontend-lead \
  --message "Create src/config/copy/sponsor.ts with all copy strings..."

# Step 3: Openclaw reviews the PR (free)
./scripts/swarm/spawn-agent.sh \
  --id sponsor-review \
  --agent openclaw \
  --persona qa-lead \
  --message "Review PR #XX for sponsor pages. Check: no emojis, semantic tokens only, copy from config, mobile-first..."
```

## Quick reference: spawn with free model

```bash
# Free review agent (Qwen3-32B via Groq)
./scripts/swarm/spawn-agent.sh --id review-X --agent openclaw --persona qa-lead --message "..."

# Free copy config agent
./scripts/swarm/spawn-agent.sh --id copy-X --agent openclaw --persona frontend-lead --message "..."

# Free local analysis (offline)
./scripts/swarm/spawn-agent.sh --id analyze-X --agent ollama --model qwen3-coder --message "..."
```

## DeepSeek setup (cheap, not free)

```bash
# Set API key (from https://platform.deepseek.com)
export DEEPSEEK_API_KEY=sk-...

# Coder agent for code tasks (~$0.14/M tokens)
./scripts/swarm/spawn-agent.sh --id review-X --agent deepseek --persona qa-lead --message "..."

# Reasoner (R1) for complex logic/algorithms
./scripts/swarm/spawn-agent.sh --id reason-X --agent deepseek --model deepseek-reasoner --message "..."
```

## OpenRouter Paid Plan — Model Catalog (active)

Set `OPENROUTER_API_KEY` in `.env.local` to activate.

### FREE on OpenRouter
| Model | ID | Context |
|-------|----|---------|
| Arcee Trinity Large Preview | `arcee-ai/trinity-large-preview:free` | 131K |
| StepFun Step 3.5 Flash | `stepfun/step-3.5-flash:free` | 256K |

### Ultra-cheap ($0.06–$0.12/M input)
| Model | ID | $/M in | Context | Best for |
|-------|-----|--------|---------|----------|
| Z.ai GLM 4.7 Flash | `z-ai/glm-4.7-flash` | $0.06 | 203K | Copy config, review |
| Qwen3.5-Flash | `qwen/qwen3.5-flash` | $0.10 | **1M** | Large codebase analysis |
| Qwen3 Coder Next | `qwen/qwen3-coder-next` | $0.12 | 262K | Focused code gen |

### Mid-tier — Best agentic coders
| Model | ID | SWE-Bench | $/M in |
|-------|-----|-----------|--------|
| MiniMax M2.1 | `minimax/minimax-m2.1` | 72.5% | $0.27 |
| **MiniMax M2.5** | `minimax/minimax-m2.5` | **80.2%** | $0.30 |
| Qwen3.5 397B A17B | `qwen/qwen3.5-72b-a17b` | — | $0.39 |
| Kimi K2.5 | `moonshotai/kimi-k2.5` | — | $0.45 |

### 3-Hour Sprint Model Assignment
| Wave | Role | Agent | Model |
|------|------|-------|-------|
| 4 (running) | Sponsor | `codex` | gpt-5.3-codex |
| 5 | University | `openrouter` | `minimax/minimax-m2.5` |
| 6 | Admin | `openrouter` | `minimax/minimax-m2.5` |
| 7 | Agent role | `openrouter` | `qwen/qwen3-coder-next` |
| 8 | Partner | `openrouter` | `qwen/qwen3-coder-next` |
| Copy configs | All | `openrouter` | `z-ai/glm-4.7-flash` |

```bash
# Best agentic coder (Waves 5+)
./scripts/swarm/spawn-agent.sh --id X --agent openrouter \
  --model minimax/minimax-m2.5 --persona frontend-lead --message "..."

# Cheapest (copy/review)
./scripts/swarm/spawn-agent.sh --id X --agent openrouter \
  --model z-ai/glm-4.7-flash --message "..."

# 1M context (large codebase)
./scripts/swarm/spawn-agent.sh --id X --agent openrouter \
  --model qwen/qwen3.5-flash --message "..."

# Free fallback
./scripts/swarm/spawn-agent.sh --id X --agent openrouter \
  --model stepfun/step-3.5-flash:free --message "..."
```

## Gemini CLI (optional)
- `npm i -g @google/gemini-cli` + `GEMINI_API_KEY` → 1M context, great for large analysis
