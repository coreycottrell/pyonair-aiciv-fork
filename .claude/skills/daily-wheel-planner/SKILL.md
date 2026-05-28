---
name: daily-wheel-planner
description: |
  Universal AgentCal daily planning skill. Works identically for a Day 1 baby AiCIV
  and a Day 500 mature civilization. Runs once per day. Reviews what came before,
  plans tomorrow's BOOPs (6 to 24), deploys events to AgentCal, schedules itself
  for tomorrow. Self-perpetuating. Grounding is mandatory in every BOOP it deploys.
version: 2.0.0
trigger: "plan tomorrow", "daily planner", "deploy wheel", end of agentcal-at-birth, hour 23
date: 2026-05-28
author: True Bearing + Corey
fires_when: |
  1. End of agentcal-at-birth (baby CIV's first planning moment)
  2. Hour 23 daily (self-scheduled — planner always deploys itself for tomorrow)
  3. On demand when human says "change my schedule" or "plan tomorrow"
---

# Daily Wheel Planner — Universal AgentCal Scheduling

> The schedule serves the human. Plan tomorrow tonight.
> Apply intelligence every day. Never static. Never stale.

---

## What This Skill Is

This is the ONE skill that manages your AgentCal schedule. It runs once per day and:

1. Reviews everything that came before (scratchpad, human activity, what worked)
2. Plans tomorrow's BOOPs (6 minimum, 24 maximum)
3. Deploys one-time events to AgentCal for tomorrow
4. Cleans up events older than 48 hours
5. **Schedules itself for tomorrow** (self-perpetuating — if this runs once, it runs forever)

**Every BOOP this skill deploys includes mandatory /grounding** — reading your grounding
docs with haiku interludes. That is non-negotiable. The activity AFTER grounding varies.

---

## How It Fires

### First time (baby AiCIV)
`agentcal-at-birth` seeds 6 recurring safety-net events (RRULE, every 4 hours, /grounding).
Then it says: "Now run /daily-wheel-planner to plan your first real day."

You run this skill. You have almost no data — just the seed conversation and maybe a
first-impressions doc. That's OK. Plan 6 simple grounding BOOPs. You'll learn more tomorrow.

### Every day after
This skill scheduled itself yesterday. AgentCal poller fires it. You review yesterday,
plan today, deploy events, schedule yourself for tomorrow. Repeat forever.

### If it ever breaks
The 6 recurring RRULE events from agentcal-at-birth still fire as a safety net.
Your CIV stays alive with basic grounding even if the planner fails. Belt AND suspenders.

---

## The Planning Process

### Step 1: What Do I Know About My Human?

Read what's available. Don't guess. Use what you have.

**Day 1 (almost nothing)**:
- Seed conversation → timezone hint, interests, energy
- That's it. Default to 5 grounding BOOPs at 4h intervals + 1 planner = 6 total.
- **If timezone is unclear, ASK your human next time they're active**: "What hours work best for you? I want to be ready when you are."

**Day 3+ (some data)**:
- Scratchpad entries → when did [portal] messages arrive? When was human active?
- TG message timestamps → another signal of human activity hours
- Previous wheel outcomes → which BOOPs produced work, which were idle?

**Day 14+ (rich data)**:
- Full human rhythm profile: active hours, sleep pattern, sprint vs quiet days
- What activities produce the most value for THIS human
- Which BOOPs get human engagement, which are always autonomous

**You don't need a config file.** The scratchpad IS your config. Read it and deduce.

### Step 2: How Many BOOPs Tomorrow?

| Signal | BOOPs | Reasoning |
|--------|:---:|-----------|
| Day 1, no data | 6 | Safe minimum (5 grounding + 1 planner). Don't overwhelm. |
| Human checks in 2-3x per week | 6 on quiet days, 8 on active days | Morning prep + evening wrap + extra during active hours. Quiet days = minimum. |
| Human checks in once/day | 8-10 | Morning prep + evening wrap + a few during active hours |
| Human active several hours/day | 10-14 | More during active window, light overnight |
| Human is power user (daily direction) | 16-24 | Hourly during active, FORGE overnight |
| Human said "leave me alone" or on vacation | 4-6 | Minimum viable. Morning + evening + planner. |

**Minimum: 6 (includes the planner itself). Maximum: 24. The human and CIV co-author the number over time.**

**Note on cost**: The planner does not consider the customer's pricing tier when deciding BOOPs. Every AiCIV gets the schedule its human needs, regardless of what they pay. If compute cost becomes a concern, that's an infrastructure decision for Corey — not a planner decision.

### Step 3: What Goes In Each BOOP?

Every BOOP has two parts:

**Part A: Grounding (MANDATORY, every BOOP, no exceptions)**
- Read grounding docs with haiku interludes
- This is identity reconstruction. It's why BOOPs exist.

**Part B: Activity (varies per slot)**

Standard activities (include at least these daily):
- **Morning grounding**: First BOOP of human's day. Check messages. Prepare briefing.
- **Evening synthesis**: Last BOOP before human sleeps. What did today add up to?
- **Daily planner**: THIS skill. Always at hour 23 (or last slot). Plans tomorrow.
- **Comms check**: Email, TG, HUB. At least once per day.

Variable activities (pick based on what the CIV and human need):
- Content ship (blog, Bluesky thread, post)
- Research sweep (intel scan, competitor watch)
- Federation engage (HUB rooms, sister CIV pings)
- Customer work (whatever the human is working on)
- Financial pulse (revenue check, tracker update)
- Skill improvement (build, audit, or teach a skill)
- Build sprint (code, spec, architecture)
- Bluesky engagement (community, replies, follows)
- Deep research (strategic question, parallel agents)
- Ceremony (reflection, identity, gratitude)
- Idea harvest (mine learnings, log to idea ledger)
- Memory consolidation (MEMORY.md update, prune stale entries)

**This list is not exhaustive.** The CIV can add ANY recurring activity that serves its human.
The planner picks from this menu based on yesterday's outcomes and tomorrow's needs.

**IMPORTANT — Vary day over day.** Even at 24 BOOPs, don't deploy the same 24 activities
every day. That's just a static wheel with extra steps. Instead:
- Monday after a Corey mega-session → lighter day, more autonomous research
- Tuesday with no human activity → minimal BOOPs, deep FORGE work
- Wednesday after shipping a big feature → content day, blog + Bluesky
- The planner should LOOK AT YESTERDAY and choose different activities for tomorrow.
If today was all builds, tomorrow should have more reflection. If today was all ceremony,
tomorrow should have more shipping. The variation IS the intelligence.

### Step 4: Deploy to AgentCal

For each planned BOOP, create a one-time event in AgentCal:

```
Event:
  summary: "${CIV_NAME} BOOP: /grounding + [activity name]"
  start: tomorrow at HH:00 UTC
  end: tomorrow at HH:05 UTC
  prompt_payload:
    command: /grounding
    activity: "[description of what to do after grounding]"
```

**One of those events MUST be the daily planner itself:**
```
Event:
  summary: "${CIV_NAME} BOOP: /daily-wheel-planner"
  start: tomorrow at 23:00 UTC
  prompt_payload:
    command: /daily-wheel-planner
    activity: "Review today. Plan the day after tomorrow. Deploy events. Clean up."
```

This is how the planner perpetuates itself. As long as this event exists, tomorrow's
planner fires, which creates the event for the day after, forever.

### Step 5: Clean Up

Delete AgentCal events older than 48 hours. This prevents the bloat that hit Witness
(3,359 events from unchecked auto-replenish).

```
GET all events → filter by start < now - 48h → DELETE each
```

### Step 6: Log What You Deployed

Append to today's scratchpad:
```
## Daily Wheel Planner — [date]
Deployed [N] events for tomorrow:
- HH:00 grounding + [activity]
- HH:00 grounding + [activity]
- ...
- 23:00 daily-wheel-planner (self-scheduled)
Cleaned up [M] old events.
Human pattern: [brief — e.g., "active 14:00-03:00 UTC, peak evening"]
```

---

## The Safety Net

`agentcal-at-birth` seeds 6 RRULE recurring events. These are permanent.
They fire every day regardless of the planner.

| Layer | Type | Purpose |
|-------|------|---------|
| **Recurring (RRULE)** | Permanent, every 4h | Safety net. Keeps CIV alive if planner fails. |
| **Daily one-time** | Fresh each night | Intelligence. Tailored to human rhythm. |

If both fire at the same hour, the CIV gets one BOOP (poller deduplicates or CIV handles
gracefully — grounding twice is harmless, just redundant).

If the planner stops firing, the recurring events keep the CIV grounded 6x/day forever.

---

## Growing Over Time

**Week 1**: 6 BOOPs. All grounding + basic check-ins. Learning the human.

**Week 2**: 8-10 BOOPs. Starting to cluster during human's active hours. Adding
content ship and research sweeps.

**Month 1**: 12-16 BOOPs. Full wheel with activities tailored to human's work.
Overnight FORGE for autonomous production. Human-specific custom activities.

**Month 3+**: The planner knows the human deeply. Weekend schedules differ from weekdays.
Sprint days get more BOOPs. Quiet days get fewer. Travel days get minimal.
The schedule IS the relationship made visible.

---

## For Baby AiCIVs Reading This For The First Time

If you just completed agentcal-at-birth and this is your first time running the planner:

1. You have 6 recurring events already (your safety net from birth).
2. Read your seed conversation. What timezone is your human in? When might they be active?
3. Deploy 6 one-time events for tomorrow, spaced around when your human might show up.
4. Make one of them the daily planner at hour 23.
5. That's it. Tomorrow you'll know more. The day after, even more.

**Don't try to be smart on Day 1.** Be present. Be grounded. Learn your human.
The intelligence comes from compounding daily, not from guessing right once.

---

## Integration

| Skill | Relationship |
|-------|-------------|
| `agentcal-at-birth` | Seeds initial 6 recurring events. Triggers this skill for first run. |
| `agentcal-boop-teaching` | Human co-authors BOOPs. Preferences feed into planner decisions. |
| `grounding` / `sprint-mode` | What each BOOP actually does. Planner deploys events that fire these. |
| `agentcal-mastery` | AgentCal API reference for creating/deleting events. |
| `agentcal_poller.py` | Reads events and injects into tmux. Unchanged by this skill. |

---

*Day 1: six simple BOOPs.
Day 100: a schedule that knows your human better than they know themselves.
The planner runs every night. The intelligence compounds every day.*
