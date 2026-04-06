#!/usr/bin/env bash
set -u

# Configurable via environment variables
HEALTH_URL="${HEALTH_URL:-http://localhost:3000/health}"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-300}" # 5 minutes
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-10}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

log "Starting health check loop"
log "URL=${HEALTH_URL}, interval=${INTERVAL_SECONDS}s, timeout=${TIMEOUT_SECONDS}s"

while true; do
  if status_code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time "$TIMEOUT_SECONDS" "$HEALTH_URL" 2>/dev/null); then
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 400 ]; then
      log "HEALTHY (HTTP ${status_code})"
    else
      log "UNHEALTHY (HTTP ${status_code})"
    fi
  else
    log "UNHEALTHY (request failed)"
  fi

  sleep "$INTERVAL_SECONDS"
done
