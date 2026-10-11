#!/usr/bin/env bash
set -euo pipefail
file="lib/storage/admin-supabase.ts"
function_body="$(sed -n '/^export async function getPendingCounts()/,$p' "$file")"
# Three authoritative queues and exact head-only counting.
for table in quotes cleaner_applications bookings; do
  grep -Fq "from(\"$table\")" <<< "$function_body"
done
test "$(grep -Fc 'count: "exact", head: true' <<< "$function_body")" -eq 3
test "$(grep -Fc '.eq("status", "pending")' <<< "$function_body")" -eq 3
grep -Fq 'pendingQuotes: quotesResult.count!' <<< "$function_body"
grep -Fq 'pendingApplications: applicationsResult.count!' <<< "$function_body"
grep -Fq 'pendingBookings: bookingsResult.count!' <<< "$function_body"
grep -Fq 'if (result.error || result.count === null)' <<< "$function_body"
if grep -Fq 'pendingQuotes: pendingBookingsResult.count' <<< "$function_body"; then
  echo "Quotes must not reuse booking counts" >&2
  exit 1
fi
if grep -Fq 'cleaner_response' <<< "$function_body"; then
  echo "Applications must be counted in cleaner_applications" >&2
  exit 1
fi
echo "Pending dashboard counts source-of-truth contract passed"
