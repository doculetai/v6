# Model Assignment Strategy

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

## Not yet set up (optional)

- **OpenRouter**: Set `OPENROUTER_API_KEY` → access to DeepSeek, Gemini Flash, 100+ free models
- **Gemini CLI**: `npm i -g @google/gemini-cli` + `GEMINI_API_KEY` → 1M context window, great for large codebase analysis
