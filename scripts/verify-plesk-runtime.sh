#!/usr/bin/env bash
set -euo pipefail
bundle="${1:?usage: verify-runtime.sh BUNDLE_DIR}"
test -f "$bundle/server.js"
test -d "$bundle/.next/static"
test -d "$bundle/public"
test -f "$bundle/.next/BUILD_ID"
if find "$bundle" -type f \( -name '.env' -o -name '.env.local' -o -name '.env.production' -o -name 'id_rsa' -o -name '*.pem' \) | grep -q .; then
  echo "Unexpected secret-bearing files in runtime bundle" >&2
  exit 1
fi
if [[ "${ALLOW_PUBLISH_WORKTREE_GIT:-false}" != "true" ]] && find "$bundle" -type d -name '.git' | grep -q .; then
  echo "Git metadata found in runtime bundle" >&2
  exit 1
fi
echo "Standalone runtime checks passed"
