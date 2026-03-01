#!/usr/bin/env bash
set -euo pipefail

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required." >&2
  exit 1
fi

PIDS=()
CLEANING=0

kill_port() {
  local port="$1"
  local pids=""

  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti tcp:"${port}" -sTCP:LISTEN 2>/dev/null || true)"
  elif command -v fuser >/dev/null 2>&1; then
    pids="$(fuser -k "${port}/tcp" 2>/dev/null | awk '{print $1}' || true)"
  fi

  if [ -n "$pids" ]; then
    echo "Port ${port} is already in use by ${pids}, stopping before startup." >&2
    kill -TERM $pids 2>/dev/null || true
    sleep 0.4
  fi

  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti tcp:"${port}" -sTCP:LISTEN 2>/dev/null || true)"
    if [ -n "$pids" ]; then
      kill -KILL $pids 2>/dev/null || true
      sleep 0.4
    fi
  fi
}

cleanup() {
  if [[ "${CLEANING}" -eq 1 ]]; then
    return
  fi
  CLEANING=1
  trap - INT TERM EXIT

  echo "Shutting down MF apps..." >&2 || true

  if [ ${#PIDS[@]} -gt 0 ]; then
    for pid in "${PIDS[@]}"; do
      if ps -p "$pid" >/dev/null 2>&1; then
        kill -TERM "$pid" 2>/dev/null || true
      fi
    done

    sleep 0.2

    for pid in "${PIDS[@]}"; do
      if ps -p "$pid" >/dev/null 2>&1; then
        kill -KILL "$pid" 2>/dev/null || true
      fi
      wait "$pid" 2>/dev/null || true
    done
  fi
}

trap cleanup INT TERM EXIT

run_app() {
  local dir="$1"
  local cmd="$2"
  local url="$3"

  (
    cd "$dir"
    echo "[start] $dir: $cmd"
    bash -lc "$cmd"
  ) &
  local pid=$!
  PIDS+=("$pid")

  if [ -n "$url" ]; then
    echo "[wait] $dir at $url"
    local ready=0
    for _ in {1..10}; do
      if curl -sf "$url" >/dev/null; then
        ready=1
        echo "[ok] $dir is ready"
        break
      fi
      sleep 0.5
    done
    if [ "$ready" -eq 0 ]; then
      echo "[error] Timeout waiting for $dir at $url" >&2
      return 1
    fi
  fi
}

kill_port 3001
kill_port 3002
kill_port 3003
kill_port 3004
kill_port 3005
kill_port 3000

run_app auth "npm run start:mf" "http://localhost:3005/assets/remoteEntry.js"
run_app header "npm run start:mf" "http://localhost:3001/assets/remoteEntry.js"
run_app products "npm run start:mf" "http://localhost:3002/assets/remoteEntry.js"
run_app archive "npm run start:mf" "http://localhost:3004/assets/remoteEntry.js"
run_app cart "npm run start:mf" "http://localhost:3003/assets/remoteEntry.js"
run_app host "npm run start" "http://localhost:3000/"

echo "All MF apps started. Press Ctrl+C to stop."
wait
