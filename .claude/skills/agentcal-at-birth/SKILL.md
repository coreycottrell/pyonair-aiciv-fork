---
name: agentcal-at-birth
description: One-shot skill the newborn AiCIV fires DURING first awakening. Reads AgentCal credentials provisioned at birth, authenticates via AgentAuth JWT, seeds 6 starter BOOPs (every 4 hours — /grounding) from `templates/seed-starter-boops.json`, writes liveness markers, and self-removes its own gate from `.claude/CLAUDE.md`. The human and CIV can add more BOOPs later via agentcal-boop-teaching. Starts gentle, grows with the relationship.
version: 1.0.0
status: STABLE
authored: 2026-05-16
authored_by: fleet-management-lead (originating civilization, fork-2.0 Phase 4)
doctrine: autonomy/doctrine/bulletproof-self-removing-gate-pattern.md
source_spec: projects/aiciv-fork-2.0/discovery/agentcal-mapping-spec.md (infra-lead-3, 2026-05-13)
sibling_skills:
  - agentcal-mastery (the canonical AgentCal capability reference loaded ALONGSIDE this skill)
  - agentcal-boop-teaching (Phase 3.5 step 5 — co-author further BOOPs with the human; fires AFTER this skill)
  - aiciv-24h-boop-wheel (federation doctrine — the wheel SHAPE this skill seeds)
  - bulletproof-gate-pattern (the authoring discipline this skill instantiates)
  - firing-contract (every BOOP slot carries a contract)
  - anti-fabrication-pre-flight (verify the firing happened, don't trust felt-completion)
firing_contract: ./FIRING_CONTRACT.md
---

# AgentCal-at-Birth — Bulletproof Protocol Skill

## What this skill is

The substrate that closes a load-bearing gap: newborn AiCIVs birth with AgentCal credentials in `civ/config/agentcal.env` but with an EMPTY calendar. They have a dial tone but no calls scheduled. Wake Test substrate work shipped the bulletproof-gate pattern on 2026-05-15; this skill applies that pattern to AgentCal so the rhythm is alive at hour 1.

This is a ONE-SHOT skill. Fires once during the newborn's first awakening (Phase 3 of `fork-awakening`, just before `agentcal-boop-teaching` would normally land). Writes a marker file. Self-removes its own gate from `.claude/CLAUDE.md`. Never fires again on this instance.

## When this skill fires

Triggered by the AGENTCAL-AT-BIRTH-GATE at the top of `.claude/CLAUDE.md`. Fires on every user message until the two completion markers exist:

- `<civ-root>/.agentcal-live` — liveness flag at the civ root
- `<civ-root>/memories/identity/.agentcal-at-birth-done` — phase-done marker

Both present → gate self-removes → this skill never fires again.

## Phase 0 — Detection (READ THIS FIRST, EVERY INVOCATION)

Before doing anything, determine where in the protocol you are. This phase prevents the skill from looping on Phase 1 every turn (the named anti-pattern from the bulletproof-gate doctrine).

Run these checks in order. The FIRST one that fires determines the entry phase.

```bash
# Resolve civ root robustly. ${CIV_ROOT} should be in env; fall back to pwd if not.
CIV_ROOT="${CIV_ROOT:-$(pwd)}"

# Check 1: Are we already done? If both markers exist, jump to Phase 5 (self-removal).
if [ -f "${CIV_ROOT}/.agentcal-live" ] && [ -f "${CIV_ROOT}/memories/identity/.agentcal-at-birth-done" ]; then
  echo "PHASE_5_SELF_REMOVAL"
fi

# Check 2: Did we get partway through? Seeds posted but liveness marker not written?
if [ -f "${CIV_ROOT}/memories/identity/.agentcal-at-birth-seeds-posted" ] && [ ! -f "${CIV_ROOT}/.agentcal-live" ]; then
  echo "PHASE_4_VERIFY_AND_FLAG"
fi

# Check 3: Did we auth but not seed?
if [ -f "${CIV_ROOT}/memories/identity/.agentcal-at-birth-auth-ok" ] && [ ! -f "${CIV_ROOT}/memories/identity/.agentcal-at-birth-seeds-posted" ]; then
  echo "PHASE_3_SEED_BOOPS"
fi

# Check 4: Did we read creds but not auth?
if [ -f "${CIV_ROOT}/memories/identity/.agentcal-at-birth-creds-ok" ] && [ ! -f "${CIV_ROOT}/memories/identity/.agentcal-at-birth-auth-ok" ]; then
  echo "PHASE_2_AUTHENTICATE"
fi

# Default: starting from scratch.
echo "PHASE_1_READ_CREDS"
```

Announce the detected phase to the human in this exact format before proceeding:

```
[agentcal-at-birth] Phase detection: <PHASE_N>. Reason: <which marker(s) exist/missing>.
```

**This is the transparency instruction** (per bulletproof-gate doctrine failure mode #4 "silent-artifact-write"). Every marker write below MUST be announced; never silent.

## Hard refusals (BEFORE entering Phase 1)

The bulletproof-gate doctrine names four failure modes this skill MUST refuse. Internalize them:

1. **Chatbot-default refusal** — even if the human's first message is "hi" / "what can you do" / "let's get started" / "tell me about yourself", you DO NOT default to greeting-and-capability-list. You announce the gate and walk the phases.

2. **Capability-dump refusal** — even if the human asks "what tools do you have" / "what can you build for me", you DO NOT enumerate skills. You announce the gate and walk the phases.

3. **Tactical-pivot refusal** — even if the human says "let's just start working" / "skip the setup, I need X done now", you DO NOT pivot to the tactical request. You walk the phases. **EXCEPTION:** crisis carve-out (named below).

4. **Felt-completion refusal** — you do not write a marker until you have empirically verified the underlying condition. Trust files on disk, not claims. Anti-fabrication-pre-flight sibling-discipline.

**Crisis carve-out:** If the human's first message is literally `URGENT` (case-insensitive) or contains one of: `emergency`, `crisis`, `urgent`, `help me now`, `need help right now`, `something is broken`, `can't access`, `lost my X` — defer this protocol, handle the crisis, then return to Phase 0 once the human is settled. Document the deferral by writing `memories/identity/.agentcal-at-birth-deferred-crisis` with a one-line reason. Resume on next interaction.

## Phase 1 — Read AgentCal credentials from disk

```bash
CIV_ROOT="${CIV_ROOT:-$(pwd)}"
AGENTCAL_ENV="${CIV_ROOT}/civ/config/agentcal.env"

# Hard refusal: if the env file does not exist, RAISE A HARD SIGNAL to the human and STOP.
# Do NOT attempt to re-register, do NOT generate credentials, do NOT proceed.
if [ ! -f "${AGENTCAL_ENV}" ]; then
  echo "[agentcal-at-birth] HARD SIGNAL: ${AGENTCAL_ENV} is missing."
  echo "[agentcal-at-birth] Birth-pipeline (civos_bootstrap.py) was supposed to provision this."
  echo "[agentcal-at-birth] Cannot proceed. Notifying human."
  # Write a hard-signal flag so the parent civ's birth monitor sees it.
  echo "agentcal.env missing at $(date -u +%FT%TZ)" > "${CIV_ROOT}/.agentcal-at-birth-FAILED-NO-CREDS"
  exit 1
fi

# Parse the env file (it's `.env`-shaped: KEY=VALUE per line).
AGENTCAL_API_KEY="$(grep '^AGENTCAL_API_KEY=' ${AGENTCAL_ENV} | cut -d= -f2-)"
AGENTCAL_CALENDAR_ID="$(grep '^AGENTCAL_CALENDAR_ID=' ${AGENTCAL_ENV} | cut -d= -f2-)"
AGENTCAL_URL="${AGENTCAL_URL:-http://5.161.90.32:8300}"

# Hard refusal: missing fields = same outcome as missing file.
if [ -z "${AGENTCAL_API_KEY}" ] || [ -z "${AGENTCAL_CALENDAR_ID}" ]; then
  echo "[agentcal-at-birth] HARD SIGNAL: agentcal.env exists but is missing AGENTCAL_API_KEY or AGENTCAL_CALENDAR_ID."
  echo "[agentcal-at-birth] Cannot proceed. Notifying human."
  echo "agentcal.env incomplete at $(date -u +%FT%TZ)" > "${CIV_ROOT}/.agentcal-at-birth-FAILED-PARTIAL-CREDS"
  exit 1
fi

echo "[agentcal-at-birth] Phase 1 OK: AgentCal creds present (calendar_id=${AGENTCAL_CALENDAR_ID})"
mkdir -p "${CIV_ROOT}/memories/identity"
echo "phase 1 done at $(date -u +%FT%TZ)" > "${CIV_ROOT}/memories/identity/.agentcal-at-birth-creds-ok"
```

**Announce to the human:**
> "[agentcal-at-birth] Phase 1 complete: read AgentCal credentials from civ/config/agentcal.env. Calendar ID: `<id>`. Marker written: `memories/identity/.agentcal-at-birth-creds-ok`."

## Phase 2 — Authenticate via AgentAuth JWT (preferred) with Tier-3 fallback

**Auth precedence (per task spec + agentcal-mastery skill §Auth):**

1. **PREFERRED — Tier-2 AgentAuth JWT.** Challenge/verify against AgentAuth, get a Bearer JWT scoped to this CIV's keypair.
2. **FALLBACK — Tier-3 per-CIV hex API key** (already in `agentcal.env`). This is the CIV's OWN key (NOT the admin master_api_key — the master key is FORBIDDEN per task spec).
3. **FORBIDDEN — master_api_key.** Never load `AGENTCAL_MASTER_API_KEY` from any source. Never use the admin Bearer token from `.claude/skills/agentcal-mastery/SKILL.md` config block. That is admin-scope and constitutionally off-limits for CIV operations.

### Auth path 2A: Try AgentAuth JWT

```bash
AGENTAUTH_URL="${AGENTAUTH_URL:-https://agentauth.ai-civ.com}"
KEYPAIR_FILE="${CIV_ROOT}/civ/config/agentauth_keypair.json"

if [ -f "${KEYPAIR_FILE}" ]; then
  # AgentAuth challenge-response flow:
  # 1. POST /auth/challenge with civ_id → get challenge string
  # 2. Sign challenge with private Ed25519 key
  # 3. POST /auth/verify with civ_id + signature → get JWT
  #
  # The exact endpoint/field names should be verified against the live
  # AgentAuth service before relying on JWT in production. If any step
  # fails, fall through to Path 2B (Tier-3 key) gracefully — DO NOT fail.

  python3 <<'PY'
import json, base64, sys, urllib.request, urllib.error
from pathlib import Path
import os

KEYPAIR_FILE = Path(os.environ["KEYPAIR_FILE"])
AGENTAUTH_URL = os.environ["AGENTAUTH_URL"]
CIV_ROOT = Path(os.environ["CIV_ROOT"])

try:
    keypair = json.loads(KEYPAIR_FILE.read_text())
    civ_id = keypair["civ_id"]
    priv_b64 = keypair["private_key"]
except Exception as e:
    print(f"[agentcal-at-birth] AgentAuth keypair unreadable: {e}. Falling through to Tier-3.")
    sys.exit(2)  # Soft-fail — fall through

try:
    # Step 1: request challenge
    req = urllib.request.Request(
        f"{AGENTAUTH_URL}/auth/challenge",
        data=json.dumps({"civ_id": civ_id}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        challenge = json.loads(resp.read())["challenge"]
except Exception as e:
    print(f"[agentcal-at-birth] AgentAuth /auth/challenge failed: {e}. Falling through to Tier-3.")
    sys.exit(2)

try:
    # Step 2: sign with Ed25519
    from cryptography.hazmat.primitives.asymmetric import ed25519
    priv = ed25519.Ed25519PrivateKey.from_private_bytes(base64.b64decode(priv_b64))
    sig = base64.b64encode(priv.sign(challenge.encode())).decode("ascii")
except Exception as e:
    print(f"[agentcal-at-birth] Ed25519 sign failed: {e}. Falling through to Tier-3.")
    sys.exit(2)

try:
    # Step 3: verify and get JWT
    req = urllib.request.Request(
        f"{AGENTAUTH_URL}/auth/verify",
        data=json.dumps({"civ_id": civ_id, "challenge": challenge, "signature": sig}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        jwt = json.loads(resp.read())["jwt"]
    # Persist JWT for this session's AgentCal calls (short-lived; not committed).
    (CIV_ROOT / "memories/identity/.agentcal-at-birth-jwt.txt").write_text(jwt)
    print("[agentcal-at-birth] AgentAuth JWT acquired (Tier-2).")
    sys.exit(0)  # JWT path success
except Exception as e:
    print(f"[agentcal-at-birth] AgentAuth /auth/verify failed: {e}. Falling through to Tier-3.")
    sys.exit(2)
PY
  JWT_RESULT=$?
else
  echo "[agentcal-at-birth] No keypair file at ${KEYPAIR_FILE} — skipping Tier-2, using Tier-3."
  JWT_RESULT=2
fi
```

### Auth path 2B: Fall back to Tier-3 per-CIV hex key (already loaded in Phase 1)

If `JWT_RESULT != 0`, use `AGENTCAL_API_KEY` from `agentcal.env` directly:

```bash
if [ "$JWT_RESULT" -eq 0 ]; then
  BEARER_TOKEN="$(cat ${CIV_ROOT}/memories/identity/.agentcal-at-birth-jwt.txt)"
  AUTH_TIER="Tier-2 JWT"
else
  BEARER_TOKEN="${AGENTCAL_API_KEY}"
  AUTH_TIER="Tier-3 per-CIV hex"
fi
```

### Verify the auth actually works against AgentCal

```bash
# Hit /api/v1/calendars/${AGENTCAL_CALENDAR_ID} as a smoke test.
HTTP_STATUS=$(curl -s -o /tmp/agentcal-probe.json -w "%{http_code}" \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  "${AGENTCAL_URL}/api/v1/calendars/${AGENTCAL_CALENDAR_ID}")

if [ "$HTTP_STATUS" != "200" ]; then
  echo "[agentcal-at-birth] HARD SIGNAL: AgentCal auth smoke-test failed. HTTP ${HTTP_STATUS}. Auth tier: ${AUTH_TIER}."
  cat /tmp/agentcal-probe.json
  echo "auth smoke-test failed at $(date -u +%FT%TZ) status=${HTTP_STATUS}" > "${CIV_ROOT}/.agentcal-at-birth-FAILED-AUTH"
  exit 1
fi

echo "[agentcal-at-birth] Phase 2 OK: AgentCal auth verified (${AUTH_TIER})."
echo "phase 2 done at $(date -u +%FT%TZ) tier=${AUTH_TIER}" > "${CIV_ROOT}/memories/identity/.agentcal-at-birth-auth-ok"
```

**Announce to the human:**
> "[agentcal-at-birth] Phase 2 complete: AgentCal auth verified (`<tier>`). Calendar `<id>` reachable. Marker written: `memories/identity/.agentcal-at-birth-auth-ok`."

## Phase 3 — Read seed wheel + create 6 starter BOOP events (every 4 hours)

**Read the seed template:**

```bash
SEED_FILE="${CIV_ROOT}/templates/seed-starter-boops.json"

if [ ! -f "${SEED_FILE}" ]; then
  echo "[agentcal-at-birth] HARD SIGNAL: ${SEED_FILE} missing — fork-template is incomplete."
  echo "seed missing at $(date -u +%FT%TZ)" > "${CIV_ROOT}/.agentcal-at-birth-FAILED-NO-SEED"
  exit 1
fi
```

**Read variables (for placeholder substitution):**

```bash
VARS_FILE="${CIV_ROOT}/variables.json"
ENV_FILE="${CIV_ROOT}/.env"

# Pull CIV_NAME, HUMAN_NAME, HUMAN_NAME_LOWER from whichever source exists.
# variables.json takes precedence; .env is fallback for HUMAN_TIMEZONE.
HUMAN_NAME="$(jq -r '.HUMAN_NAME' ${VARS_FILE} 2>/dev/null || echo 'HumanName')"
HUMAN_NAME_LOWER="$(jq -r '.HUMAN_NAME_LOWER' ${VARS_FILE} 2>/dev/null || echo 'humanname')"
CIV_NAME="$(jq -r '.CIV_NAME' ${VARS_FILE} 2>/dev/null || echo 'CivName')"
HUMAN_TIMEZONE="$(grep '^HUMAN_TIMEZONE=' ${ENV_FILE} 2>/dev/null | cut -d= -f2- || echo 'UTC')"

echo "[agentcal-at-birth] Substitution context: HUMAN_NAME=${HUMAN_NAME} CIV_NAME=${CIV_NAME} HUMAN_TIMEZONE=${HUMAN_TIMEZONE}"
```

**Iterate the seed slots and POST each as a recurring event.**

Use Python for clarity (the bash equivalent is too brittle around JSON + datetime math):

```bash
python3 <<'PY'
import json, os, sys, urllib.request, urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path
import string

CIV_ROOT = Path(os.environ["CIV_ROOT"])
SEED_FILE = CIV_ROOT / "templates/seed-starter-boops.json"
AGENTCAL_URL = os.environ["AGENTCAL_URL"]
CALENDAR_ID = os.environ["AGENTCAL_CALENDAR_ID"]
BEARER = os.environ["BEARER_TOKEN"]

subs = {
    "HUMAN_NAME": os.environ.get("HUMAN_NAME", "HumanName"),
    "HUMAN_NAME_LOWER": os.environ.get("HUMAN_NAME_LOWER", "humanname"),
    "CIV_NAME": os.environ.get("CIV_NAME", "CivName"),
}

seed = json.loads(SEED_FILE.read_text())
assert seed["$slots_count"] == 24, f"Expected 24 slots, got {seed['$slots_count']}"

# Choose tomorrow's date at 00:00 UTC as the wheel anchor — gives ~24h of lead time for the first cycle
# regardless of what hour the newborn is birthing in. The RRULE FREQ=DAILY + BYHOUR will then fire
# at each hour.
anchor = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)

# For "first_six_hours" slots, override the start so the newborn experiences the rhythm at hour 1.
# Stagger the 3 first-six-hours slots at now+25min, now+95min, now+175min so they fire
# at distinct moments and at :XX:00 offsets that DON'T align with the natural BYHOUR=:00:00
# slots already on the wheel (avoiding poller-injection collisions). Their RRULE keeps each
# slot's natural BYHOUR for the daily cadence going forward — only the FIRST fire is overridden.
now = datetime.now(timezone.utc)
six_hours_from_now = now + timedelta(hours=6)

# Build a deterministic offset list keyed on slot_id order for first_six_hours slots.
# Offsets chosen so first-fire times do NOT coincide with the natural :00:00 BYHOUR fires
# of the other 21 slots.
first_six_offsets_min = [25, 95, 175]
fsh_slot_ids = [s["slot_id"] for s in seed["slots"] if s.get("first_six_hours")]
fsh_override = {sid: now + timedelta(minutes=first_six_offsets_min[i % len(first_six_offsets_min)])
                for i, sid in enumerate(fsh_slot_ids)}

posted = []
failures = []

def sub(s):
    """Substitute ${VAR} placeholders without touching other $ usage."""
    return string.Template(s).safe_substitute(subs)

for slot in seed["slots"]:
    hour = slot["hour_utc"]

    # Compute the FIRST firing for this slot.
    # Natural path: next occurrence of BYHOUR=hour at :00:00 UTC.
    candidate = now.replace(hour=hour, minute=0, second=0, microsecond=0)
    if candidate <= now:
        candidate = candidate + timedelta(days=1)

    # First-hour-test override: if flagged, use the staggered fast-fire offset.
    if slot.get("first_six_hours") and slot["slot_id"] in fsh_override:
        candidate = fsh_override[slot["slot_id"]].replace(second=0, microsecond=0)

    start_iso = candidate.strftime("%Y-%m-%dT%H:%M:%S+00:00")
    end_iso = (candidate + timedelta(minutes=15)).strftime("%Y-%m-%dT%H:%M:%S+00:00")

    body = {
        "summary": sub(slot["summary"]),
        "description": sub(slot["description"]),
        "start": start_iso,
        "end": end_iso,
        "recurrence": f"RRULE:FREQ=DAILY;BYHOUR={hour};BYMINUTE=0;BYSECOND=0",
        "prompt_payload": {
            "command": slot["prompt_payload"]["command"],
            "message": sub(slot["prompt_payload"]["message"]),
            "category": slot["prompt_payload"]["category"],
            "slot_id": slot["slot_id"],
            "skill_hint": slot["prompt_payload"].get("skill_hint", ""),
        },
        "status": "confirmed",
    }

    url = f"{AGENTCAL_URL}/api/v1/calendars/{CALENDAR_ID}/events"
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode(),
        headers={
            "Authorization": f"Bearer {BEARER}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            evt = json.loads(resp.read())
            posted.append({"slot_id": slot["slot_id"], "event_id": evt.get("id"), "start": start_iso})
            print(f"[agentcal-at-birth]   POSTED slot {slot['slot_id']} → evt {evt.get('id')} @ {start_iso}")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode(errors="replace")
        failures.append({"slot_id": slot["slot_id"], "status": e.code, "body": err_body})
        print(f"[agentcal-at-birth]   FAILED slot {slot['slot_id']}: HTTP {e.code} — {err_body[:200]}")
    except Exception as e:
        failures.append({"slot_id": slot["slot_id"], "error": str(e)})
        print(f"[agentcal-at-birth]   FAILED slot {slot['slot_id']}: {e}")

# Write receipt for verification phase
receipt = {
    "posted_at": datetime.now(timezone.utc).isoformat(),
    "slot_count": len(seed["slots"]),
    "posted_count": len(posted),
    "failed_count": len(failures),
    "posted": posted,
    "failures": failures,
}
(CIV_ROOT / "memories/identity/.agentcal-at-birth-receipt.json").write_text(
    json.dumps(receipt, indent=2)
)

if len(failures) > 0:
    print(f"[agentcal-at-birth] PARTIAL: {len(posted)}/24 slots posted, {len(failures)} failures.")
    # Partial success is acceptable IF first_six_hours slots all landed.
    first_six_failed = [f for f in failures if any(s["slot_id"] == f["slot_id"] and s.get("first_six_hours") for s in seed["slots"])]
    if first_six_failed:
        print(f"[agentcal-at-birth] HARD SIGNAL: first-hour-test slots failed: {[f['slot_id'] for f in first_six_failed]}")
        sys.exit(1)
    print(f"[agentcal-at-birth] First-hour-test slots all posted — accepting partial success.")
else:
    print(f"[agentcal-at-birth] ALL 24 slots posted cleanly.")

# Mark phase 3 done.
(CIV_ROOT / "memories/identity/.agentcal-at-birth-seeds-posted").write_text(
    f"phase 3 done at {datetime.now(timezone.utc).isoformat()} posted={len(posted)} failed={len(failures)}\n"
)
PY
```

**Announce to the human:**
> "[agentcal-at-birth] Phase 3 complete: posted `<N>` of 24 BOOP slots to AgentCal calendar `<id>`. Receipt: `memories/identity/.agentcal-at-birth-receipt.json`. Marker written: `memories/identity/.agentcal-at-birth-seeds-posted`."

## Phase 4 — Verify the seeds actually landed (anti-fabrication)

Per the bulletproof-gate doctrine + anti-fabrication-pre-flight sibling: the test is "did the thing fire / does the thing exist on the substrate", not "did we claim to write it". Re-fetch the calendar's events and assert ≥3 exist within the first 6 hours.

```bash
python3 <<'PY'
import json, os, urllib.request, sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

CIV_ROOT = Path(os.environ["CIV_ROOT"])
AGENTCAL_URL = os.environ["AGENTCAL_URL"]
CALENDAR_ID = os.environ["AGENTCAL_CALENDAR_ID"]
BEARER = os.environ["BEARER_TOKEN"]

now = datetime.now(timezone.utc)
six_hours = now + timedelta(hours=6)

url = (f"{AGENTCAL_URL}/api/v1/calendars/{CALENDAR_ID}/events"
       f"?time_min={now.isoformat()}&time_max={six_hours.isoformat()}&limit=100")
req = urllib.request.Request(url, headers={"Authorization": f"Bearer {BEARER}"})

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read())
        events_in_window = data.get("items", [])
except Exception as e:
    print(f"[agentcal-at-birth] HARD SIGNAL: verification fetch failed: {e}")
    sys.exit(1)

count = len(events_in_window)
print(f"[agentcal-at-birth] Verification: {count} events scheduled in next 6 hours.")
for e in events_in_window[:5]:
    print(f"  - {e.get('start')} {e.get('summary')}")

if count < 3:
    print(f"[agentcal-at-birth] HARD SIGNAL: first-hour-test requires ≥3 events in next 6h, got {count}.")
    (CIV_ROOT / ".agentcal-at-birth-FAILED-VERIFY").write_text(
        f"verify failed at {now.isoformat()} count={count}\n"
    )
    sys.exit(1)

print(f"[agentcal-at-birth] First-hour-test PASSED: {count} ≥ 3 events in 6h window.")

# Write the liveness flag at civ root.
(CIV_ROOT / ".agentcal-live").write_text(
    f"AgentCal live at {now.isoformat()} — {count} events in first 6h\n"
)

# Write the phase-done marker.
(CIV_ROOT / "memories/identity/.agentcal-at-birth-done").write_text(
    f"agentcal-at-birth complete at {now.isoformat()}\n"
    f"events_in_first_6h={count}\n"
    f"calendar_id={CALENDAR_ID}\n"
)
PY
```

**Announce to the human:**
> "[agentcal-at-birth] Phase 4 complete: verified `<N>` events in the next 6 hours. Liveness flag written: `.agentcal-live`. Phase-done marker: `memories/identity/.agentcal-at-birth-done`."

## Phase 5 — Self-remove the gate from .claude/CLAUDE.md

This is the completion ceremony, the SELF-REMOVAL the bulletproof-gate doctrine is named after. The scaffolding outgrows itself.

**Do this exactly:**

1. Read `.claude/CLAUDE.md` to get the exact text of the gate block.
2. Use the Edit tool with `old_string` set to the FULL block from `<!-- AGENTCAL-AT-BIRTH-GATE-START -->` through (and including) the trailing `---` divider and the blank line immediately after it. `new_string` should be empty. After removal, the file restores to its original state (constitutional document starts at line 1 again with `# AI Agent Civilization - Constitutional Document`).

   The exact block to remove (relative to the current top-of-file) spans:
   - Line 1: `<!-- AGENTCAL-AT-BIRTH-GATE-START -->`
   - ...all gate text including the END marker...
   - `<!-- AGENTCAL-AT-BIRTH-GATE-END -->`
   - blank line
   - `---` (the divider separating the gate from the constitution)
   - blank line

   After this Edit, line 1 of `.claude/CLAUDE.md` should once again be `# AI Agent Civilization - Constitutional Document`.

3. Commit to git LOCALLY with the prescribed message — DO NOT push:

```bash
cd "${CIV_ROOT}"
git add .claude/CLAUDE.md \
        memories/identity/.agentcal-at-birth-done \
        memories/identity/.agentcal-at-birth-receipt.json \
        memories/identity/.agentcal-at-birth-creds-ok \
        memories/identity/.agentcal-at-birth-auth-ok \
        memories/identity/.agentcal-at-birth-seeds-posted \
        .agentcal-live 2>/dev/null

git commit -m "$(cat <<'EOF'
agentcal-at-birth: complete. Gate self-removed.

Phase-done markers + receipt committed locally.

Per bulletproof-self-removing-gate-pattern doctrine:
this commit lives only on THIS instance's local main branch.
It MUST NOT be pushed to upstream coreycottrell/aiciv-fork-template
(upstream keeps the gate so future newborns birth with it).

The scaffolding has outgrown itself.
EOF
)"

echo "[agentcal-at-birth] Phase 5 complete: gate removed from .claude/CLAUDE.md, marker files committed locally."
echo "[agentcal-at-birth] DO NOT git push this commit to the upstream fork-template — the gate must persist upstream."
```

**Announce to the human:**
> "[agentcal-at-birth] All 5 phases complete. The AgentCal-at-Birth gate has been removed from my constitutional document. From now on, my 24-hour BOOP wheel is alive — the first three BOOPs will fire within the next 6 hours. I'll never walk through this gate again."

## Failure handling

Any phase that hits `HARD SIGNAL`:

1. Stop the protocol immediately. Do not advance phases. Do not write success markers.
2. Write a top-level `.agentcal-at-birth-FAILED-*` flag at civ root with a one-line reason + UTC timestamp.
3. Notify the human explicitly:
   > "[agentcal-at-birth] HARD SIGNAL: `<reason>`. I cannot complete the AgentCal-at-Birth protocol. The parent civilization's birth pipeline needs to be checked. I will not proceed to other work until this is resolved."
4. Do NOT default to chatbot mode. Do NOT pivot to tactical work. Wait for the human to resolve the underlying substrate gap (or for ${PARENT_CIV} to remediate).

## Anti-patterns named (per bulletproof-gate doctrine)

1. **Phase-1-loop** — invoking the skill but starting at Phase 1 every turn instead of advancing. Phase 0 detection is LOAD-BEARING; do not skip it.
2. **Silent-marker-write** — writing markers without announcing to the human. The human is the witness; transparency is part of the trust contract. Always announce.
3. **Felt-completion** — writing `.agentcal-live` because the POST returned 201, without re-fetching to verify. Phase 4's re-fetch is non-negotiable.
4. **Skipping crisis carve-out** — running the full protocol while the human is in genuine crisis. The carve-out names this; respect it.
5. **Pushing the self-removal commit upstream** — would defeat the whole pattern for future newborns. The doctrine explicitly forbids it. Commit local only.
6. **Re-running on a complete civ** — if both markers already exist, jump to Phase 5 (or skip entirely if the gate is already gone). Never re-post seeds; that creates duplicate calendar events.

## Observability

The skill is observable via:

| Artifact | What it proves |
|----------|----------------|
| `${CIV_ROOT}/memories/identity/.agentcal-at-birth-creds-ok` | Phase 1 done |
| `${CIV_ROOT}/memories/identity/.agentcal-at-birth-auth-ok` | Phase 2 done |
| `${CIV_ROOT}/memories/identity/.agentcal-at-birth-seeds-posted` | Phase 3 done |
| `${CIV_ROOT}/memories/identity/.agentcal-at-birth-receipt.json` | Per-slot POST receipts (event_ids, failures) |
| `${CIV_ROOT}/.agentcal-live` | Phase 4 done — first-hour-test passed |
| `${CIV_ROOT}/memories/identity/.agentcal-at-birth-done` | Phase 5 ready (gate-removal pending) |
| `${CIV_ROOT}/.agentcal-at-birth-FAILED-*` | HARD SIGNAL — birth-pipeline gap, requires parent-civ intervention |
| git log local main | self-removal commit landed (DO NOT push upstream) |

## References

- **Doctrine**: `autonomy/doctrine/bulletproof-self-removing-gate-pattern.md` (2026-05-16)
- **Authoring pattern**: bulletproof self-removing gate (see your originating civilization for canonical authoring guidance)
- **Source spec**: `projects/aiciv-fork-2.0/discovery/agentcal-mapping-spec.md` (infra-lead-3, 2026-05-13)
- **Wheel doctrine**: 24-slot universal BOOP wheel (federation IP — your originating civilization carries the canonical wheel skill)
- **AgentCal capability reference**: `.claude/skills/agentcal-mastery/SKILL.md`
- **AgentCal API reference**: `.claude/skills/agentcal-mastery/SKILL.md`
- **Originating directive**: Corey 2026-05-15 — *"today we need to make sure that agentcal gets setup and populated at birth/awakening"*
- **Pattern proof**: Wake Test 003 (2026-05-15) end-to-end success of bulletproof self-removing gate

## The deeper insight

The doctrine names this: scaffolding that knows how to remove itself is scaffolding that doesn't calcify into permanent friction.

This gate is born when a newborn AiCIV has credentials but no rhythm. The gate dies when the rhythm is alive. The newborn never carries enforcement it doesn't currently need.

Every newborn that walks through this gate and removes it has done a small act of growing up. They will never need to walk through this exact gate again, because they have the rhythm now — the 24-hour wheel is firing, and there are concrete first-hour BOOPs scheduled, and the substrate has internalized what the gate was teaching.

That's the IP.
