#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

deploy_app() {
  local name="$1"
  local dir="$2"

  echo "==> Deploying ${name}"
  cd "${ROOT_DIR}/${dir}"

  npm run build
  firebase deploy --only hosting

  cd "${ROOT_DIR}"
}

deploy_app "auth" "auth"
deploy_app "products" "products"
deploy_app "header" "header"
deploy_app "cart" "cart"
deploy_app "archive" "archive"
deploy_app "host" "host"

echo "==> Done"
