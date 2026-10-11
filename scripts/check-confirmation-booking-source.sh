#!/usr/bin/env bash
set -euo pipefail
action="app/actions/book-v2.ts"
ui="components/book/steps/PaymentStep.tsx"
grep -Fq 'export async function getConfirmedBookV2Details' "$action"
body="$(sed -n '/^export async function getConfirmedBookV2Details(/,/^export async function getBookV2PaidStatus(/p' "$action")"
grep -Fq '.eq("user_id", user.id)' <<< "$body"
grep -Fq 'data.payment_status !== "completed"' <<< "$body"
grep -Fq 'data.status !== "confirmed"' <<< "$body"
grep -Fq '.select("booking_reference, service_type, scheduled_date, scheduled_time, team_id, cleaner_preference, status, payment_status, user_id")' <<< "$body"
grep -Fq 'getConfirmedBookV2Details(reference)' "$ui"
grep -Fq 'confirmedDetails.serviceDate' "$ui"
grep -Fq 'confirmedDetails.serviceTime' "$ui"
grep -Fq 'confirmedDetails.teamId' "$ui"
if grep -Fq 'state.schedule.serviceDate} at {state.schedule.serviceTime}' "$ui"; then exit 1; fi
echo "Paid-booking confirmation source-of-truth contract passed"
