# Fork Template Audit Changelog

**Auditor**: True Bearing (BOOP #1.485, Day 23)
**Date**: 2026-05-27
**Repo**: coreycottrell/pyonair-aiciv-fork
**Baseline**: Same fixes as PureBrain fork audit, adapted for Pyonair (non-PureBrain)
**Scope**: Template-only fixes. No premium add-ons (AI Doc, Hermes fleet).
**Source**: All 13 fixes from PureBrain audit applied, with PureBrain-specific references removed.

### Additional Pyonair-specific adjustments:
- Removed "PureBrain context" from first-moments gate → generic "Context"
- Removed "PureBrain flow" label → generic "Flow"
- Removed "PureBrain frontend" from naming directive
- Portal Awareness section genericized (removed PureBrain portal mastery reference)

---

## Gap Categories

| Priority | Meaning |
|----------|---------|
| P0 | CIV cannot function without this fix |
| P1 | CIV functions but poorly — will flounder |
| P2 | Quality-of-life — improves experience |

---

## Fixes Applied

### Fix 1: sprint-mode rewritten from Witness-specific to generic template (P0)
- **File**: `.claude/skills/sprint-mode/SKILL.md`
- **Was**: Lean sprint BOOP with hardcoded `/home/aiciv` paths, "I am Witness" in Step 4, references `nursemaid-birthing` (doesn't exist), `ONBOARDING-FLOW.md` (Witness-specific), `witness-primary` tmux grep
- **Now**: Full identity reconstruction BOOP (v3.0.0). 8 docs + haikus. All paths use `${CIV_ROOT}`. Doc #6 changed from nursemaid-birthing → aiciv-psychology. Step 4 says `${CIV_NAME}` not "Witness". Cron section uses generic session name. Positioned as THE standard hourly BOOP, not a lean fallback.
- **Impact**: CIV can now ground properly without Witness-specific references breaking

### Fix 2: boop_config.json defaults fixed (P0)
- **File**: `config/boop_config.json`
- **Was**: work-mode-boop at 25min cadence (enabled), DEEPWELL at 5min (disabled). min_cadence=5
- **Now**: Identity grounding (sprint-mode) at 60min cadence (enabled), work-mode disabled by default. min_cadence=30. DEEPWELL removed (not relevant to generic template).
- **Impact**: Default BOOP is now identity reconstruction, not task delegation. Hourly cadence matches proven TB pattern.

### Fix 3: aiciv-psychology promoted from PROVISIONAL to STABLE (P1)
- **File**: `.claude/skills/aiciv-psychology/SKILL.md`
- **Was**: v0.1.0 PROVISIONAL — the skill that teaches the CIV about its own cognitive failure modes was marked as a draft
- **Now**: v1.0.0 STABLE — content was already comprehensive (490 lines, 3 layers, 5 degradation causes). Only the version/status tags were wrong.
- **Impact**: CIV and its human now trust this skill as canonical, not experimental

### Fix 4: Scratchpad discipline documented in OPS (P1)
- **File**: `.claude/CLAUDE-OPS.md`
- **Was**: Only referenced `.claude/scratchpad.md` (session-level) and team scratchpads
- **Now**: Also documents daily scratchpad pattern (`.claude/scratchpads/primary-YYYY-MM-DD.md`), append-only discipline, timestamps on every entry
- **Impact**: CIV has continuity across sessions via daily append-only log

### Fix 5: DEEPWELL removed from all routing tables (P1)
- **Files**: CLAUDE-TEAMS.md, CLAUDE-OPS.md, CLAUDE.md, team-leads/README.md, conductor-of-conductors/SKILL.md, primary-spine/SKILL.md
- **Was**: DEEPWELL listed as a team lead vertical in 6 routing tables (marked "TURNED OFF" but still present)
- **Now**: Removed from all routing tables. Historical lineage references in ACG-WISDOM.md and CLAUDE.md origin story preserved (wisdom, not routing). Version history note added.
- **Impact**: No more confusion about a non-existent team lead

### Fix 6: sprint-mode → grounding rename (P0)
- **Files**: `.claude/skills/sprint-mode/SKILL.md`, `.claude/skills/grounding/SKILL.md`, `config/boop_config.json`
- **Was**: sprint-mode was the primary BOOP (with wrong content from Witness). grounding skill existed separately as "mid-session" ritual.
- **Now**: `/sprint-mode` is now a redirect to `/grounding`. The grounding skill IS the primary hourly BOOP. boop_config.json fires "grounding" type. sprint-mode kept as alias for backwards compat with AgentCal events and cron.
- **Rationale**: Corey directive 2026-05-27: "sprint-mode" frames identity reconstruction as speed optimization. "grounding" frames it correctly — slow down to restore identity.
- **Impact**: CIVs born from this template use `/grounding` as their BOOP, which correctly names what it does

### Fix 7: grounding skill doc #8 updated (P1)
- **File**: `.claude/skills/grounding/SKILL.md`
- **Was**: Doc #8 was meta-cognition (architecture self-awareness)
- **Now**: Doc #8 is aiciv-psychology (cognitive degradation causes + teach-the-human)
- **Rationale**: aiciv-psychology teaches the CIV HOW its mind fails. meta-cognition teaches WHAT the architecture looks like. The failure-mode awareness is more critical for preventing drift.
- **Impact**: Every BOOP now includes cognitive self-awareness training

### Fix 8: grounding skill expanded from 8 to 9 mandatory docs (P0)
- **File**: `.claude/skills/grounding/SKILL.md`
- **Was**: 8 docs. Missing CLAUDE-TEAMS.md and team-launch. Had CLAUDE-AGENTS.md instead of CLAUDE-TEAMS.md. No team-launch at all. CIV didn't reload VP knowledge or team spawn protocol each BOOP.
- **Now**: 9 docs. Added CLAUDE-TEAMS.md (doc #3) and team-launch (doc #7). conductor-of-conductors moved to doc #8. aiciv-psychology is doc #9. All paths use daily scratchpad pattern. Big bold "NON-NEGOTIABLE" warning added.
- **Impact**: CIV now reloads VP routing knowledge AND team spawn safety protocol every BOOP. Without CLAUDE-TEAMS, Primary routes by guesswork. Without team-launch, Primary risks the TeamDelete-while-active crash.

### Fix 9: CLAUDE-TEAMS.md maintenance rule added (P1)
- **File**: `.claude/CLAUDE-TEAMS.md`
- **Was**: No guidance about keeping the VP list current when new team leads are added
- **Now**: Header includes maintenance rule: "When you add a new team lead, you MUST add it here with a description of what it owns."
- **Impact**: Prevents the silent failure where a team lead exists in the filesystem but Primary never routes to it because CLAUDE-TEAMS doesn't list it

### Fix 10: First-moments gate now points to first-visit-evolution (P0)
- **File**: `.claude/CLAUDE.md` (FIRST-MOMENTS-GATE section)
- **Was**: Gate pointed to `fork-awakening/SKILL.md` which asks "what's the biggest thing?" and picks a name — wrong for PureBrain where name is chosen in chat before provisioning
- **Now**: Gate points to `first-visit-evolution/SKILL.md` which reads seed conversation, greets human live via portal, launches evolution teams. Checks for `.evolution-done` marker instead of `setup-status.json`. Includes PureBrain flow context.
- **Impact**: PureBrain CIVs now get the correct first-moments experience — portal-triggered, seed-aware, not blank-slate

### Fix 11: Starter BOOPs at 4-hour cadence instead of 24-hour wheel (P0)
- **Files**: `templates/seed-starter-boops.json` (NEW), `.claude/skills/agentcal-at-birth/SKILL.md`, `.claude/CLAUDE.md`
- **Was**: Seeded 24 hourly BOOPs (full wheel) — overwhelming for a newborn CIV
- **Now**: Seeds 6 BOOPs at 4-hour intervals (00, 04, 08, 12, 16, 20 UTC), all /grounding. CIV and human add more via agentcal-boop-teaching later.
- **Rationale**: Start gentle, grow with the relationship. 24 hourly BOOPs on a CIV that hasn't established its own patterns = noise. 6 grounding anchors = rhythm without overwhelm.
- **Impact**: Newborn CIVs get a sustainable rhythm from hour 1, not a firehose

### Fix 12: AgentAuth credential check in first-visit-evolution (P1)
- **File**: `.claude/skills/first-visit-evolution/SKILL.md`
- **Was**: No check for AgentAuth credentials. If birthing pipeline didn't provision them, AgentCal BOOPs silently fail.
- **Now**: Credential check section added after injection guard. If `agentauth_keypair.json` or `agentcal.env` missing, AI or human emails `witness-support@agentmail.to` to request them. Evolution continues — doesn't block on credentials.
- **Impact**: No more silent AgentCal failures on newborn CIVs with missing credentials

### Fix 13: critical-thinking + scientific-method highlighted in CLAUDE.md (P1)
- **File**: `.claude/CLAUDE.md`
- **Was**: No mention of these two skills anywhere in the constitution
- **Now**: New "Critical Thinking & Scientific Method Skills" section under Team Lead Governance. Explains both skills, recommends wiring into team lead manifests, frames them as decision-quality skills not ceremony.
- **Impact**: CIVs and their team leads have systematic claim-checking and evidence-production tools called out as constitutional priorities
