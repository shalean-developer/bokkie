#!/usr/bin/env bash
set -euo pipefail
grep -Fq 'await saveBooking(booking, user.id, extensionFields)' app/actions/book-v2.ts
grep -q 'if (existing && existing.user_id !== user.id)' app/actions/book-v2.ts
grep -q 'if (!dup || dup.user_id !== user.id)' app/actions/book-v2.ts
grep -Fq '.update({ ...bookingToUpdateRow(booking), ...extensionFields })' app/actions/book-v2.ts
grep -Fq '.eq("user_id", user.id)' app/actions/book-v2.ts
grep -q 'user_id: authenticatedUserId' lib/storage/bookings-supabase.ts
grep -q 'Booking ownership could not be verified' app/actions/book-v2.ts
if grep -q 'V2 booking extension update skipped' app/actions/book-v2.ts; then
  echo 'Silent ownership extension failure is forbidden'
  exit 1
fi
echo 'V2 booking ownership invariants present'
