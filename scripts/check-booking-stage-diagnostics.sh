#!/usr/bin/env bash
set -euo pipefail
file=app/actions/book-v2.ts
for stage in authenticate service_client reference_lookup pricing update_existing insert_new duplicate_lookup duplicate_retry extension; do
  grep -q "stage = \"$stage\"" "$file"
done
grep -Fq '"[BOK-PLESK-13H02] booking save failure"' "$file"
grep -q 'traceId,' "$file"
grep -q 'code,' "$file"
if grep -q 'console.error.*bookingReference' "$file"; then
  echo "Do not log booking reference in diagnostics" >&2
  exit 1
fi
echo "Booking diagnostic stage contract passed"
