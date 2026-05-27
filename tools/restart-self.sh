#!/bin/bash
# AICIV Self-Restart Script (generic — reads identity from .aiciv-identity.json)
# Usage: ssh root@HOST "docker exec -u aiciv <CONTAINER> bash /home/aiciv/civ/tools/restart-self.sh"
# Safe: kills ALL old Claude processes and sessions, then launches fresh.

IDENTITY_FILE="/home/aiciv/.aiciv-identity.json"
if [ -f "$IDENTITY_FILE" ]; then
    CIV=$(python3 -c "import json; print(json.load(open('$IDENTITY_FILE'))['civ_id'])" 2>/dev/null)
    PROJECT_DIR=$(python3 -c "import json; print(json.load(open('$IDENTITY_FILE')).get('project_dir', '/home/aiciv'))" 2>/dev/null)
fi
CIV="${CIV:-unknown}"
PROJECT_DIR="${PROJECT_DIR:-/home/aiciv}"
SESSION="${CIV}-primary-$(date +%Y%m%d-%H%M%S)"

echo "Launching new session: $SESSION (civ=$CIV, project_dir=$PROJECT_DIR)"

# --- Cleanup: kill ALL old Claude processes and sessions ---
# Step 1: Kill Claude Code processes FIRST (tmux kill-session alone leaves orphans)
CLAUDE_PROCS=$(pgrep -c -f "claude" 2>/dev/null || echo 0)
echo "Found $CLAUDE_PROCS Claude process(es) to kill"
pkill -f "claude" 2>/dev/null || true

# Step 2: Kill orphaned playwright-mcp and node processes from Claude
pkill -f "playwright" 2>/dev/null || true
pkill -f "@anthropic-ai/claude-code" 2>/dev/null || true

# Step 3: Kill all old primary tmux sessions
for old_session in $(tmux list-sessions -F "#{session_name}" 2>/dev/null | grep -- "-primary" || true); do
    echo "Killing stale session: $old_session"
    tmux kill-session -t "$old_session" 2>/dev/null || true
done

# Step 4: Kill TG bot processes so the new session starts fresh
pkill -f "telegram_unified.py" 2>/dev/null || true
pkill -f "telegram_bot.py" 2>/dev/null || true

# Step 5: Wait for processes to fully die
sleep 3

# Verify cleanup
REMAINING=$(pgrep -c -f "claude" 2>/dev/null || true)
REMAINING=${REMAINING:-0}
if [ "$REMAINING" -gt 0 ]; then
    echo "WARNING: $REMAINING Claude process(es) survived SIGTERM, sending SIGKILL..."
    pkill -9 -f "claude" 2>/dev/null || true
    sleep 1
fi

tmux new-session -d -s "$SESSION" -c "$PROJECT_DIR" -x 200 -y 50
echo "$SESSION" > /home/aiciv/.current_session

# Also write to project dir marker (portal checks both locations)
if [ -d "$PROJECT_DIR" ]; then
    echo "$SESSION" > "$PROJECT_DIR/.current_session" 2>/dev/null || true
fi

# Verify: exactly one primary session should exist
PRIMARY_COUNT=$(tmux list-sessions -F "#{session_name}" 2>/dev/null | grep -c -- "-primary" || echo 0)
if [ "$PRIMARY_COUNT" -gt 1 ]; then
    echo "WARNING: $PRIMARY_COUNT primary sessions found after cleanup! Killing extras..."
    for extra in $(tmux list-sessions -F "#{session_name}" 2>/dev/null | grep -- "-primary" | grep -v "^${SESSION}$" || true); do
        echo "Killing extra session: $extra"
        tmux kill-session -t "$extra" 2>/dev/null || true
    done
fi
echo "Verified: session $SESSION is active, .current_session updated"

# Auto-register in pane registry (pane identity system)
if [ -f "/home/aiciv/civ/tools/pane_registry.py" ]; then
    python3 /home/aiciv/civ/tools/pane_registry.py register \
        --name "${CIV}-primary" --role primary --session "$SESSION" 2>/dev/null || true
fi

tmux send-keys -t "$SESSION" 'claude --dangerously-skip-permissions' Enter

echo "Waiting 35s for Claude to load..."
sleep 35

# Dismiss session picker dialog with spaced Enter presses
for i in 1 2 3 4 5; do
  tmux send-keys -t "$SESSION" Enter
  sleep 2
done

# Send the wake-up prompt
tmux send-keys -t "$SESSION" 'Run /wake-up skill. Good morning. Your human is waiting.'

# Spaced Enter retries to ensure submission fires
for i in 1 2 3 4 5; do
  sleep 2
  tmux send-keys -t "$SESSION" Enter
done

echo "Wake-up skill triggered in $SESSION"
echo "Wait for haiku on Telegram to confirm alive."

# Start TG bot if not running (2-line safety net)
sleep 5
pgrep -f "/home/aiciv/civ.*telegram_unified.py" > /dev/null || /home/aiciv/civ/tools/start_telegram_bot.sh 2>/dev/null || true
