# Kill-Sonnet Sweep — pyonair-aiciv-fork (2026-06-11)

**Directive (Corey)**: Kill anything that sets a model to sonnet. Minimum model floor = **opus 4.8**. Main-session launchers get the `[1m]` suffix (unlocks 1M context); agent/API model fields get `claude-opus-4-8`.

**Branch**: `sonnetkill-20260611`
**Repo**: pyonair-aiciv-fork (origin: git@github.com:coreycottrell/pyonair-aiciv-fork.git)
**Executor**: Infrastructure VP (incarnation 3 of the kill-sonnet compounding role — after TB's own repo + canonical fork-template @ 27757fe)

## Repo character
This is a **portal / provisioning repo** (Vite/React portal + `portal_server.py` FastAPI backend + agent-manifest templates), **NOT a full civ genome**. Consequence:
- There is **no `tools/launch_civ_tower.sh`** (the genome main-session launcher). The launcher-equivalent here is the in-code Claude spawn inside `portal_server.py` `api_resume` (line 1607) — and it got the `[1m]` treatment.
- The 8 agent manifests in `agents/*.md` were **already** `model: opus` (no sonnet present) — nothing to fix there.

## FILES CHANGED (2)

### 1. `portal_server.py` (2 model-settings KILLED)
- **Line 1607** — the main-session spawn (the launcher of this repo):
  - BEFORE: `f"claude --model claude-sonnet-4-6 --dangerously-skip-permissions "`
  - AFTER:  `f"claude --model 'claude-opus-4-8[1m]' --dangerously-skip-permissions "`
  - `[1m]` suffix is CORRECT + PROVEN here — this is a main-session Claude launch, so it unlocks the 1M context window.
- **Line 6194** — `api_agents_create` model default (the value baked into every newly-created agent manifest):
  - BEFORE: `model = (body.get("model") or "sonnet").strip()`
  - AFTER:  `model = (body.get("model") or "claude-opus-4-8").strip()`
  - Full ID (not `[1m]`) — this is an agent-manifest model field, not a main-session launch.

### 2. `skills/org-hire/SKILL.md` (1 model-setting KILLED)
- **Line 65** — the agent-create JSON payload TEMPLATE that org-hire instructs callers to POST:
  - BEFORE: `"model": "sonnet",`
  - AFTER:  `"model": "claude-opus-4-8",`
  - This template propagates into every agent hired via org-hire → must default to opus.

**Manifests/agent-model fields changed: 0 in `agents/*.md` (already opus); 2 model defaults in code/skill templates that GENERATE manifests.**

## KEPT (residual `sonnet` strings — NOT model-settings)
- `portal_server.py:1523-1524` — `MODEL_CONTEXT` lookup table mapping `claude-sonnet-4-6` → 200_000 and `claude-sonnet-4-6[1m]` → 1_000_000 context-token capacities. This is a **context-window reference table** (tells the portal how big each model's window is), NOT a model selection. Same class as CC's model-catalog KEEP. **KEEP.**
- `README.md:178` — `- **model**: \`opus\`, \`sonnet\`, \`haiku\`, or \`inherit\`` — documentation listing the *valid values* of the model field, not a setting. **KEEP** (prose/reference).

## GROUND-TRUTH VERIFICATION
`grep -rIn -E "model.{0,3}(:|=).{0,3}['\"]?(claude-)?sonnet" .` (excluding .git/node_modules/package-lock) → **0 hits**.
Broad `grep -i sonnet` → only the 2 documented KEEPs above remain.
**Residual real sonnet model-settings = 0.**

## Compounding note (vs template)
This fork is **structurally different** from the canonical fork-template: it is a portal/provisioning app, not a genome. The fix surface is the in-code Python spawn + API default + one skill template — NOT a launcher shell script + ~110 manifest frontmatters. The `[1m]`-vs-full-ID distinction held: `[1m]` only on the main-session launch (portal_server.py:1607), full `claude-opus-4-8` on the agent-manifest model fields.
