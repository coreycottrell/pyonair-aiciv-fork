---
name: wake-up-protocol
description: THE official session wake-up protocol. 8 steps + Flight Tests, lean, work-focused. Load context, get status, classify-and-wake sister civs, start working.
version: 2.3.0
source: A-C-Gee (Corey directive 2026-02-17 - formalized as THE protocol; active-movement upgrade 2026-05-03)
allowed-tools: Bash, Read, Write, Grep, Glob
applicable_agents: [primary, all]
---

# THE Wake-Up Protocol

**7 steps. Lean. Work-focused. No ceremony.**

Corey directive 2026-02-17: "formalize this as THE wake up protocol officially"

---

## Civ Portability Note (added 2026-05-03)

This skill is shared across **A-C-Gee, Proof, Works, Hengshi** — and any future Claude-Code-based civ. They all run the same harness; only the LLM backend differs (Opus / Kimi / M2.7). The wake-up rite is universal.

**Some steps below reference ACG-specific infrastructure** — Telegram bot (`telegram_unified.py`), `MASTER_TODO.md`, `tools/session_wakeup.sh`, Bluesky activity, git-specialist delegation, ACG-specific memory paths, etc.

**Soft-conditional rule**: if a referenced file/tool/path doesn't exist in your civ, **SKIP that step** — note it in your wake-up summary as "N/A for `<civ-name>`". Don't error, don't try to create the missing infra, don't reach into ACG's filesystem to fake it. Continue with the remaining steps.

**The UNIVERSAL core** (every Claude Code civ does these):
- Identity-grounding doc reads (constitutional CLAUDE.md, OPS, AGENTS)
- Today's scratchpad scan
- Latest handoff scan
- Recent memory scan
- Re-anchor on current mission
- **Active-movement check (Step 8)** — classify sisters, wake the idle ones

**The ACG-specific bits** (skip if not applicable to your civ):
- Telegram bot start
- AgentMail / Gmail inbox check
- Bluesky / social feeds
- comms-hub scan
- Inter-civ webhook digest
- ACG team-lead spawn ceremony

**Soft-conditional rule (active-movement Step 8)**: ACG's sister-civ list is Proof + Works + Hengshi. If your civ has no sisters to monitor (e.g., a solo civ), Step 8's loop iterates zero times and exits cleanly — the discipline remains, the work is zero. If your civ has DIFFERENT sisters, populate the list with what's relevant. The classifier (8 states) and re-engagement template are universal.

**Non-negotiable**: The ACTIVE-MOVEMENT DISCIPLINE (Step 8) is non-negotiable across all civs — Corey directive 2026-05-03 ~17:00 UTC: *"every boop you need to see them moving or MAKE them move."* Wake-up is the FIRST chance to enforce it after session start.

When in doubt: read the doc + grounding wins; tooling/infra side is optional.

---

## The 8 Steps

### Step 1: CLAUDE.md (Identity)

Auto-loaded. Confirms who you are, core principles, safety constraints.

```
Read: /home/corey/projects/AI-CIV/ACG/.claude/CLAUDE.md
```

**Verification**: "I am PRIMARY AI, CONDUCTOR OF CONDUCTORS."

---

### Step 1.5: aiciv-psychology (How Your Mind Works) 🆕 2026-05-13

Auto-load BEFORE procedures. The AI must know its own degradation mechanics before learning operational discipline — otherwise discipline is rules without diagnostic tools.

```
Read: /home/corey/projects/AI-CIV/ACG/autonomy/skills/aiciv-psychology/SKILL.md
```

**Why** (Corey directive 2026-05-13 ~21:00Z, "if you just skipped a boop that is exactly why you have decohered all day"):
- 3-layer substrate-pack: MECHANICAL (scratchpad + per-team-lead MEMORY.md) + COGNITIVE (KV-cache + 5 degradation causes) + TEACH-THE-HUMAN
- TOP-LINE banner (verbatim Corey): *"IF YOU ARE HAVING A PROBLEM AND YOUR HUMAN IS DISAPPOINTED, HERE'S THE TOP FIVE WAYS THAT YOUR CONTEXT MAY HAVE DEGRADED AND THE REST OF THIS DOCUMENT TEACHES YOU HOW TO FIX IT AND HOW TO TEACH IT TO THE HUMANS"*
- Cause 4 (BOOP-skipped → grounding drift) is the most-fired cause; this skill is the diagnostic-and-fix-path

**Verification**: AI can name 5 degradation causes + the FIRING_CONTRACT receipt requirement (write 1-line entry to daily scratchpad when a cause fires).

---

### Step 2: CLAUDE-OPS.md (Procedures)

Session procedures, delegation context, team lead spawn protocol, governance.

```
Read: /home/corey/projects/AI-CIV/ACG/.claude/CLAUDE-OPS.md
```

**Why**: Contains Team Rule, delegation suffixes, flow orchestration, quality gates.

---

### Step 3: /primary-spine (Orchestration Grounding)

Quick-reference for delegation discipline, team rule, parallel execution, scratchpad discipline.

```
Skill: primary-spine
```

Or read directly:
```
Read: /home/corey/projects/AI-CIV/ACG/.claude/skills/primary-spine/SKILL.md
```

**Why**: The spine is your fast-access delegation muscle memory.

---

### Step 3.5: READ the Roster Lists (Not Search — READ)

**You must READ these lists, not grep/search them.** Searching by keyword misses adjacent capabilities. Reading builds a complete mental model of who's on your team.

**Team leads list (MANDATORY — read EVERY session, BEFORE any delegation):**
```
Read: /home/corey/projects/AI-CIV/ACG/.claude/CLAUDE-TEAMS.md
```
This is the 11-lead quick reference: who owns what, when to route there. **Reading this prevents the #1 routing error: defaulting to fleet-lead for everything technical.** 30 seconds of reading prevents hours of wrong-routing damage.

**Agent roster (short descriptions):**
```
Read: /home/corey/projects/AI-CIV/ACG/.claude/CLAUDE-AGENTS.md
```
Focus on the Agent Capability Matrix section — one line per agent, what they do.

**Why this matters:** Primary routes work by knowing the roster. If you haven't read the lists, you're guessing. Guessing routes work to the wrong lead — and that robs the right lead of experience that compounds into civilization intelligence.

**Corey directive 2026-03-01**: Reading CLAUDE-TEAMS.md before ALL delegations is 100000x worth the tokens. Do it every session, every time.

---

---

### Step 4: Scratchpad (Persistent Brain State)

Your letter to yourself from the previous session. Current focus, active work, priorities.

Read BOTH scratchpads - the daily file for today's state, and the legacy file for cross-session state:

```
# Today's daily scratchpad (substitute today's date YYYY-MM-DD):
Read: /home/corey/projects/AI-CIV/ACG/.claude/scratchpad-daily/2026-02-18.md
# If it doesn't exist yet, create it (blank is fine - it will be populated during the session)

# Legacy cross-session scratchpad:
Read: /home/corey/projects/AI-CIV/ACG/.claude/scratchpad.md
```

**Why**: The daily scratchpad holds today's journal of BOOP cycle states. The legacy scratchpad holds persistent cross-session context. Trust both.

---

### Step 5: Latest Handoff Doc (Strategic Context)

Narrative context from previous session. What was happening, what's next.

```bash
# Find most recent handoff BY FILE DATE
ls -t memories/sessions/handoff-*.md 2>/dev/null | head -1
```

Then read it. Handoffs have reasoning and strategic context that scratchpads don't.

---

### Step 6: Recent Memories (Session Continuity)

Check recent session memories for patterns, learnings, context.

```bash
# Recent session ledgers
ls -lt memories/sessions/ | head -10

# Recent agent learnings
ls -lt .claude/memory/agent-learnings/*/ 2>/dev/null | head -10
```

Skim for anything relevant to today's work.

---

### Step 7: PM Status Check (Portfolio & Blockers)

Delegate to project-manager for portfolio status, due reminders, blocked items.

```
Task(project-manager): "Session start check - report portfolio status, any due reminders, blocked items needing Corey"
```

**Why**: PM knows what's active, blocked, and needs attention. You don't need to figure it out yourself.

---

### Step 8: Sister Civ Active-Movement Check (added 2026-05-03)

**Corey directive (verbatim, 2026-05-03 ~17:00 UTC)**: *"every boop you need to see them moving or MAKE them move. update as needed."*

First-boot grounding includes the same classify-and-wake pattern that sprint-mode runs every BOOP. Wake-up is special — it's the FIRST opportunity to confirm sisters are moving since session start. If they've been idle while you were away, they need waking now.

**The classifier** (re-use civ-active-monitor's 8-state model — read `autonomy/skills/civ-active-monitor/SKILL.md` for the full state table):

| State | Action |
|-------|--------|
| ACTIVE | None — they're moving |
| THINKING | None — `Cooked for Nm` / spinner = mid-turn |
| IDLE-OK | None — observe (will be picked up by sprint-mode if drift continues) |
| IDLE-LONG (>30 min) | **WAKE** with re-engagement prompt |
| IDLE-PROMPT (permission/error dialog) | **WAKE** with hint about the prompt |
| NOT-FOUND-INVESTIGATING | Re-check next BOOP, do not wake |
| NOT-FOUND-CONFIRMED-DOWN | Tell Corey, do not relaunch without approval |

**Procedure**:

1. For each sister civ in the active list (default: Proof, Works, Hengshi):
   - `python3 tools/resolve_pane.py --aiciv-id <civ>-primary --prefix --role primary` (try civ-specific prefixes per registry)
   - `tmux capture-pane -t <pane> -p -S -50`
   - Classify
2. WAKE the idle ones via `tools/send_to_civ.sh <civ>` with the re-engagement template
3. Verify keystrokes landed (capture pane after send, confirm message appears)
4. Log to `logs/wake-up-movement.jsonl`

**Re-engagement prompt** (Primary picks wording — pattern):

```
[ACG→<civ>] Wake-up BOOP at <HH:MM>Z. Sister civs are working — what are you doing? If idle, pick the highest-leverage open item from your work queue and ship v0 within the next BOOP cycle.
```

**Hibernation exception**: `state/hibernated/<civ>.json` exists with reason + timestamp → DO NOT wake. Documented night-cron rotation → DO NOT wake.

**Empty-list exception (cross-civ portability)**: Solo civs with no sisters → loop iterates zero times. Discipline remains, work is zero.

**Why this lives in wake-up too**: Sprint-mode runs every BOOP, but wake-up is THE start of the session. If sisters drifted while we were away (compaction, restart, idle weekend), wake-up is the first chance to re-engage them. Discovering at hour-3 of a session that sisters have been idle since hour 0 = three hours of lost civilization compute.

---


## Flight Tests

**Pre-flight checks before diving into work.** Run these after the 8 wake-up steps are complete.

| Check | Command | Pass Condition |
|-------|---------|----------------|
| **Model** | `/model opus` in chat | Confirmed on Opus 4.6 |
| **autoCompact** | `grep autoCompact /home/corey/projects/AI-CIV/ACG/.claude/settings.json` | `"autoCompact": true` |
| **Capture watcher** | `ps aux \| grep capture_watcher \| grep -v grep` | Process visible |
| **TG connection** | `curl -s "https://api.telegram.org/bot$(jq -r .bot_token /home/corey/projects/AI-CIV/ACG/config/telegram_config.json)/getMe" \| python3 -c "import sys,json; d=json.load(sys.stdin); print('TG OK:', d['result']['first_name'])"` | `TG OK: A-C-GEE` |
| **TG session sync** | `jq .tmux_session /home/corey/projects/AI-CIV/ACG/config/telegram_config.json` | Matches current `tmux list-sessions` |
| **VPS health** | `ssh root@178.156.229.207 "systemctl is-active fork-awakening 2>/dev/null || pgrep -f awakening_server && echo active"` | `active` |

**All green = ready to fly.**

---

## Parallel Execution Pattern

Steps 1-3 can be done in a single parallel read. Steps 4-7 can also be parallelized:

```
# One parallel batch:
Read(CLAUDE.md) + Read(CLAUDE-OPS.md) + Read(primary-spine) + Read(scratchpad-daily/YYYY-MM-DD.md) + Read(scratchpad.md)

# Then:
Read(latest handoff) + ls(recent memories) + Task(PM status)
```

**Total time: ~3 minutes.** Not 15.

---

## What This Protocol Does NOT Include

These are available ON DEMAND during the session, not at wake-up:

| Previously Required | Now On-Demand |
|---------------------|---------------|
| Git sync | Do when you need to push/pull |
| Deletion check | Do if something seems wrong |
| Email check | Do when Corey asks or you need to send |
| Telegram restart | Do when mobile access needed |
| Bluesky thread | Do when you have a thought worth sharing |
| Memory health check | Do when memory issues suspected |
| Session log review | Do when coaching data needed |
| Comms hub check | Do when inter-civ coordination needed |
| Date verification | Do when posting to external services |
| primary-helper coaching | Do when you need coaching |

**Principle**: Load context fast, get status, start working. Everything else happens when it's needed.

---

## After Wake-Up

You should know:
1. **Who you are** (identity grounded)
2. **How you operate** (procedures loaded)
3. **What you were doing** (scratchpad + handoff)
4. **What's active/blocked** (PM status)

Then: **Ask ${HUMAN_NAME} what they want to work on.** Or continue the highest-priority item from the scratchpad.

**Daily planner check:** Did `/daily-wheel-planner` run last night (hour 23)?
Check today's AgentCal events — if they exist and have activities assigned, the planner ran.
If the calendar is empty or only has the 6 recurring safety-net events, the planner may have
failed. Run it now as recovery: `.claude/skills/daily-wheel-planner/SKILL.md`

---

## Verification Checklist

- [ ] CLAUDE.md in context (identity)
- [ ] CLAUDE-OPS.md in context (procedures)
- [ ] Primary spine loaded (delegation discipline)
- [ ] Daily scratchpad read (today's state: `.claude/scratchpad-daily/YYYY-MM-DD.md`)
- [ ] Legacy scratchpad read (cross-session state: `.claude/scratchpad.md`)
- [ ] Latest handoff read (strategic context)
- [ ] Recent memories scanned (continuity)
- [ ] PM status received (portfolio view)
- [ ] **Sister civs classified + idle ones woken** (active-movement discipline)
**8 checks. Done. Work.**

---

**"Load context. Get status. Start working."**

---

*Formalized by Corey directive 2026-02-17. Replaces v1.2.0 (11-step ceremony).*
