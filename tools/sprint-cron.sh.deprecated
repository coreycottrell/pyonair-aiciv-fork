#!/bin/bash
# Sprint-mode BOOP cron
# Injects /sprint-mode skill at configured intervals
# Run: nohup bash ${CIV_ROOT}/tools/sprint-cron.sh > /tmp/sprint-cron.log 2>&1 &
# Stop: pkill -f sprint-cron.sh

INTERVAL=1800  # seconds (30 minutes) — adjust as needed
CIV_NAME_LOWER="${CIV_NAME_LOWER}"  # Template variable, replaced during fork

while true; do
  sleep "$INTERVAL"
  
  # Find the primary session pane
  PANE=$(tmux list-panes -a -F '#{pane_id} #{session_name}' | grep "${CIV_NAME_LOWER}-primary" | head -1 | awk '{print $1}')
  
  if [ -n "$PANE" ]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Injecting /sprint-mode into pane $PANE"
    tmux send-keys -t "$PANE" '/sprint-mode' Enter
  else
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARNING: No ${CIV_NAME_LOWER}-primary session found"
  fi
done
