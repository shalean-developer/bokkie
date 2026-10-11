#!/usr/bin/env bash
set -euo pipefail
action=app/actions/book-v2.ts
storage=lib/storage/bookings-supabase.ts
grep -Fq 'const extensionFields = getBookV2ExtensionPayload(authoritativeState)' "$action"
grep -Fq 'await saveBooking(booking, user.id, extensionFields)' "$action"
count=$(grep -Fc '.update({ ...bookingToUpdateRow(booking), ...extensionFields })' "$action")
if [ "$count" -ne 2 ]; then echo "Expected owned existing and retry updates to contain V2 fields" >&2; exit 1; fi
grep -Fq '...(extensionFields ?? {})' "$storage"
grep -Fq '.eq("user_id", user.id)' "$action"
grep -Fq 'existing.user_id !== user.id' "$action"
grep -Fq 'existing?.payment_status === "completed"' "$action"
if grep -Fq 'applyV2Extension(' "$action"; then echo "A separate extension write is prohibited" >&2; exit 1; fi
echo "V2 single-write persistence contract passed"
