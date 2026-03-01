#!/usr/bin/env bash
set -euo pipefail

packages=(host header cart products archive auth)

directive="--package-lock-only"
if [[ "${1:-}" == "--full" ]]; then
  directive=""
fi

for pkg in "${packages[@]}"; do
  echo "==> sync lockfile: ${pkg}"
  if [[ -n "$directive" ]]; then
    (cd "$pkg" && npm install --package-lock-only)
  else
    (cd "$pkg" && npm install)
  fi
  printf '\033[32mOK\033[0m %s\n' "$pkg"
done

echo "lockfile sync done"
