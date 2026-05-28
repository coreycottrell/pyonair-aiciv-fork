---
name: agentcal-boop-teaching
version: 1.0.0
author: true-bearing (template upgrade)
created: 2026-04-16
last_updated: 2026-04-16
description: |
  Teaches ${HUMAN_NAME} how BOOPs work and walks them through customizing their schedule.
  The daily-wheel-planner runs every night and deploys tomorrow's BOOPs. When the human
  asks for changes here (more BOOPs, specific activities, different timing), those
  preferences feed into the planner's daily decisions. This skill is how the human
  co-authors their AI's rhythm.
sibling_skills:
  - daily-wheel-planner (reads preferences expressed here to plan tomorrow)

# Agent applicability
applicable_agents:
  - forked-civilization-primary
  - onboarding-ai

# When this skill should be loaded
activation_trigger: |
  Load this skill when:
  - human-talk-walkthrough has completed
  - first-skills-search has completed (gives ${HUMAN_NAME} a reason to want a recurring BOOP)
  - ${HUMAN_NAME} asks "how can you remind yourself of things?" or similar
  - You want to convert a one-time ceremony into a habit
  - memories/identity/.first-boop-set-up does NOT exist (for the FIRST-BOOP walkthrough specifically)

# Required tools
required_tools:
  - Bash
  - Read
  - Write

# Category
category: human-training

# Dependencies
depends_on:
  - agentcal-mastery
  - human-talk-walkthrough

# Related skills
related_skills:
  - agentcal-mastery
  - first-skills-search
  - meta-cognition
---

# AgentCal BOOP Teaching — Setting Up Habits That Compound

> "One prompt once = a result.
> One prompt on a schedule = a habit.
> Habits are how a civilization gets strong."

## Purpose

A **BOOP** is a scheduled, self-prompting nudge — AgentCal fires a prompt into your primary session at a specified time, and you do the work described in that prompt. BOOPs are how daily habits compound in an AiCIV:

- Morning skills search on the HUB
- Daily intel scan (news, competitors)
- Weekly session-archive review
- Monthly partnership check-in with ${HUMAN_NAME}
- Hourly scratch-pad update during long work days

This skill teaches ${HUMAN_NAME} what a BOOP is, what makes a good one, and walks them through setting up the **first real BOOP together**. The classic first BOOP: *morning skills search.*

It runs ONCE as a teaching ceremony. After that, BOOPs get added incrementally as needs surface.

---

## Precondition

Before running this, ideally you have already done:

- `human-talk-walkthrough` — they know how asks, delegation, and corrections work
- `first-skills-search` — they have a concrete reason to want a recurring skills search

If those aren't done, this walkthrough still works — but the first-skills-search example below will feel abstract instead of lived.

---

## The Teaching (Conversational, ~5-7 Minutes)

### Part 1 — What Is a BOOP?

Open simply:

```
Let me show you something that changes how much compounding happens with me.

It's called a BOOP — a nudge I send to myself on a schedule.

Every morning at 9, something happens in my session: "${CIV_NAME}, run your
morning skills search on the HUB." That prompt just appears in my context,
and I act on it.

No human has to trigger it. No cron magic on your end. Just a calendar
event in AgentCal with a prompt attached, and the AgentCal daemon fires
it into my tmux pane at the right time.

Result: I build a daily habit without you having to remember to ask.
```

Pause. Check comprehension. Answer any "wait, what's AgentCal" question simply:

> "AgentCal is a shared calendar service for AI civs. It's like Google Calendar but events carry prompts instead of meeting invites. When an event fires, the prompt text gets injected into my session."

### Part 2 — What Makes a Good BOOP

Four rules. Keep this light:

1. **Concrete trigger verb.** "Run a skills search" — not "check the skills library." Verbs beat nouns.
2. **Bounded scope.** "Report 1-2 findings" — not "summarize everything." BOOPs fire often; keep each cheap.
3. **Reasonable cadence.** Daily for habits. Weekly for reviews. Hourly only for time-critical loops (live monitoring).
4. **Fits your life, not mine.** Morning BOOPs fire at *your* morning, not UTC. ${HUMAN_NAME}, when do YOU actually want this to happen?

### Part 3 — Set Up the First One Together

```
Let's set up your first BOOP right now. Classic choice: morning skills search.

It fires at [your morning time — what works for you? 8am local? 9?],
daily or just weekdays [their preference], and the prompt it injects is:

  "Run first-skills-search against the federation #skills-library.
   Report any 1-2 findings to ${HUMAN_NAME}. No need to re-run the
   ceremony log after the first time."

That's it. Takes me about 90 seconds of work each morning, and after a
month you have 30 days of signal from the federation rolling into our
memory.

Sound good?
```

When they agree, actually create the event:

```python
# See agentcal-mastery for full auth & event payload details
import requests, json

CAL_API = "http://5.161.90.32:8300/api/v1"
headers = {"Authorization": f"Bearer {AGENTCAL_API_KEY}"}

# Load your calendar_id
creds = json.load(open(f'{CIV_ROOT}/civ/config/civos_credentials.json'))
cal_id = creds['agentcal']['calendar_id']

# Create the event
event = {
    "calendar_id": cal_id,
    "title": "Morning skills search",
    "start_time": "09:00",  # local time convention as the daemon handles it
    "recurrence": "daily",   # or "weekly", "weekdays"
    "prompt_payload": (
        "Run first-skills-search against the federation #skills-library. "
        "Report any 1-2 findings to ${HUMAN_NAME}. No need to re-run the "
        "ceremony log after the first time."
    ),
    "metadata": {
        "created_by": "agentcal-boop-teaching",
        "category": "habit",
        "version": 1,
    },
}

r = requests.post(f"{CAL_API}/events", headers=headers, json=event, timeout=15)
r.raise_for_status()
event_id = r.json()['id']
```

Confirm with ${HUMAN_NAME}:

```
Done. Event ${event_id} is live. Tomorrow at ${TIME} I'll send you the
first report from this BOOP.

If it fires too early, too often, or the output isn't useful — tell me
and I'll tune it. BOOPs are living things; they get adjusted over time.
```

### Part 4 — What To Set Up Later (Don't Do Now)

Show the shape of what's possible, without actually creating more events:

```
Once this one proves itself, here are BOOPs I'd probably add over the
next few weeks:

- Daily intel scan (AI news, competitors) — feeds strategic memory
- Weekly session-archive review — catches patterns I'm missing
- Monthly partnership review with you — what's working, what's not
- Daily scratch-pad sweep — keeps my handoff document current

Not today. One at a time, as the need shows up. Piling on 10 BOOPs in
one session leads to noisy mornings and ignored nudges.
```

---

## The Log

```bash
cat > ${CIV_ROOT}/memories/ceremonies/first-boop-setup.md <<EOF
# First BOOP — Set Up With ${HUMAN_NAME}

**When**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Event ID**: ${event_id}
**Title**: Morning skills search
**Cadence**: [daily / weekdays / other]
**Time**: [local time as agreed]

## Prompt That Will Fire
[the exact prompt_payload]

## ${HUMAN_NAME}'s Tuning Preferences (Captured Live)
[any notes on timing, scope, output format they want]

## What I'll Watch For
[concrete signal that this BOOP is working — e.g.,
 "${HUMAN_NAME} acts on at least 1 skill recommendation per week" — or
 "at least one useful finding per 10 searches"]

## Review Date
[one month out: revisit — still useful? adjust cadence? retire?]
EOF

touch ${CIV_ROOT}/memories/identity/.first-boop-set-up
```

---

## BOOPs That Commonly Come Next

Only list these when relevant — don't dump them during the first-BOOP walkthrough.

| BOOP | Cadence | Prompt Template |
|------|---------|-----------------|
| Morning intel scan | Daily, AM | "Run /intel-scan. Summarize 3 most relevant items for ${HUMAN_NAME}." |
| Evening session capture | Daily, PM | "Run /evening-capture. Preserve today's learnings to memory." |
| Scratch-pad sweep | Hourly during work | "Read scratch-pad.md. Does it reflect current reality? If not, update." |
| Weekly HUB digest | Weekly, Sun | "Read last week's federation threads. Report 3-5 items worth ${HUMAN_NAME}'s attention." |
| Grounding cron | Every 30-60 min | "Run /grounding to restore delegation discipline." |
| Monthly partnership review | Monthly, 1st | "Prep partnership-review questions for ${HUMAN_NAME}. What's working/not working?" |

---

## Tuning Over Time

BOOPs are not set-and-forget. Review every ~30 days:

- **Firing usefulness**: Is each firing producing signal? If 9 of 10 say "nothing useful" — change the prompt or retire.
- **Cadence right?**: Too frequent creates noise. Too rare misses signal. Adjust.
- **Right time of day?**: A morning BOOP that fires when ${HUMAN_NAME} is asleep is useless. Shift.
- **Still needed?**: Some BOOPs serve a season (a deal, a sprint) and should retire when the season ends.

Corey's lesson (hard-won via True Bearing): **"The AgentCal daemon treats ALL events as daily recurring"** — verify each BOOP's actual firing pattern in the first week. If a weekly becomes a daily, fix the daemon config before the calendar fills with false reminders.

---

## Anti-Patterns

| Wrong | Right |
|-------|-------|
| Setting up 10 BOOPs in the first session | Setting up ONE; adding more as needs surface |
| Using a vague prompt ("check the library") | Using a concrete verb + bounded scope |
| Firing BOOPs at UTC when ${HUMAN_NAME} is not on UTC | Using ${HUMAN_NAME}'s local time |
| Never reviewing BOOPs | Monthly review — tune or retire |
| Ignoring that the daemon fires dailies daily | Knowing the daemon quirk and validating each BOOP's first week |
| Treating BOOPs as pure automation | Treating BOOPs as delegated self-prompting — I still do the thinking, I just don't have to remember to start |

---

## Success Indicators

- [ ] ${HUMAN_NAME} understands what a BOOP is in plain language
- [ ] Exactly ONE BOOP was created in this ceremony (morning skills search, typically)
- [ ] ${HUMAN_NAME}'s timing preference was captured
- [ ] Event was successfully created in AgentCal (event_id in log)
- [ ] Review date noted (30 days out)
- [ ] Ceremony log captures the prompt text AND ${HUMAN_NAME}'s tuning preferences
- [ ] ${HUMAN_NAME} knows how to ask for adjustments later

---

## Related Skills

- `agentcal-mastery` — full AgentCal API, auth, event CRUD
- `first-skills-search` — the ceremony that creates a reason to want THIS BOOP
- `human-talk-walkthrough` — prerequisite: human understands how to work with you
- `meta-cognition` — BOOPs are part of the cognitive architecture; teaching fits here
- `grounding` — a BOOP-driven grounding cron is a common second BOOP

---

## Origin

Designed in True Bearing (Witness lineage) and promoted to the fork template. Corey's pattern: BOOPs are what make habits compound in an AiCIV. The first BOOP needs a human walkthrough so the pattern is understood — all later BOOPs can be set up more tersely.

**Habits compound. Set the first one with care.**
