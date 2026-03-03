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

  echo "Shutting down MF dev apps..." >&2 || true

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
  local expected=$3
  local wait_timeout="${4:-20}"

  (
    cd "$dir"
    echo "[start-dev] $dir: $cmd"
    bash -lc "$cmd"
  ) &
  local pid=$!
  PIDS+=("$pid")

  if [ -n "$expected" ]; then
    echo "[wait-dev] $dir at $expected"
    local ready=0
    for _ in $(seq 1 "$wait_timeout"); do
      if curl -sf "$expected" >/dev/null; then
        ready=1
        echo "[ok-dev] $dir is ready"
        break
      fi
      sleep 0.25
    done
    if [ "$ready" -eq 0 ]; then
      echo "[error] Timeout waiting for $dir at $expected" >&2
      return 1
    fi
  fi
}

start_remote_dev() {
  local dir="$1"
  local port="$2"
  local expected="http://localhost:${port}/assets/remoteEntry.js"

  (
    cd "$dir"
    echo "[start-dev] $dir: build --watch + vite preview --port ${port}"

    npm run build -- --mode development --watch --emptyOutDir false &
    local build_pid=$!

    cleanup_remote() {
      if ps -p "${build_pid}" >/dev/null 2>&1; then
        kill -TERM "${build_pid}" 2>/dev/null || true
        wait "${build_pid}" 2>/dev/null || true
      fi
    }

    trap cleanup_remote INT TERM EXIT

    for _ in {1..20}; do
      if [ -f "dist/assets/remoteEntry.js" ] || [ -f "dist/remoteEntry.js" ]; then
        break
      fi
      sleep 0.25
    done

    if ! [ -f "dist/assets/remoteEntry.js" ] && ! [ -f "dist/remoteEntry.js" ]; then
      echo "build did not produce remoteEntry.js for port ${port}" >&2
      exit 1
    fi

    kill_port "${port}"
    npm exec -- vite preview --host 0.0.0.0 --strictPort --port "${port}" --mode development
  ) &

  local pid=$!
  PIDS+=("$pid")

  echo "[wait-dev] ${dir} at ${expected}"
  local ready=0
  for _ in $(seq 1 20); do
    if curl -sf "${expected}" >/dev/null; then
      ready=1
      echo "[ok-dev] ${dir} is ready"
      break
    fi
    sleep 0.25
  done
  if [ "$ready" -eq 0 ]; then
    echo "[error] Timeout waiting for ${dir} at ${expected}" >&2
    return 1
  fi
}

kill_port 3001
kill_port 3002
kill_port 3003
kill_port 3004
kill_port 3005
kill_port 3000

start_remote_dev auth 3005
start_remote_dev header 3001
start_remote_dev products 3002
start_remote_dev archive 3004
start_remote_dev cart 3003
start_remote_dev host 3000

echo "All MF apps started in DEV mode. Press Ctrl+C to stop."
wait
