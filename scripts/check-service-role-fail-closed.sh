#!/usr/bin/env bash
set -euo pipefail
file="lib/supabase/server.ts"
grep -q 'SUPABASE_SERVICE_ROLE_KEY is required for privileged database operations' "$file"
if grep -q 'falling back to anon key' "$file"; then
  echo "Privileged Supabase client must not silently fall back to anonymous access" >&2
  exit 1
fi
echo "Service-role fail-closed contract passed"
