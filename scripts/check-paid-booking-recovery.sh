#!/usr/bin/env bash
set -euo pipefail
action=app/actions/book-v2.ts
page=components/book/steps/PaymentStep.tsx
grep -Fq 'export async function getBookV2PaidStatus(' "$action"
grep -Fq '.eq("user_id", user.id)' "$action"
grep -Fq 'getBookV2PaidStatus(reference)' "$page"
grep -Fq 'Payment already completed' "$page"
grep -Fq '{!alreadyPaid && <Button' "$page"
grep -Fq 'setAlreadyPaid(true)' "$page"
grep -Fq 'href="/dashboard/bookings"' "$page"
grep -Fq 'if (payInit.message === "This booking has already been paid.")' "$page"
grep -Fq 'setPaidReference(saveResult.bookingReference)' "$page"
echo "Paid booking recovery UI contract passed"
