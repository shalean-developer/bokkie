#!/usr/bin/env bash
set -euo pipefail
file=app/api/health/static-assets/route.ts
grep -Fq 'process.env.BOKKIE_APP_ENV !== "staging"' "$file"
grep -Fq 'stat(path.join(process.cwd(), ".next", "static", "chunks", file))' "$file"
grep -Fq '"Cache-Control": "no-store"' "$file"
grep -Fq 'status: 404' "$file"
echo "Staging-only static asset probe contract passed"
