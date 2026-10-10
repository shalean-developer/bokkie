#!/usr/bin/env bash
set -euo pipefail
file=app/actions/rebook-payment.ts
grep -Fq 'tx.status !== "success"' "$file"
grep -Fq 'tx.reference !== paymentReference' "$file"
grep -Fq 'Number(tx.amount) !== expectedAmount' "$file"
grep -Fq 'tx.metadata?.booking_reference !== bookingReference' "$file"
grep -Fq '.neq("payment_status", "completed")' "$file"
grep -Fq 'booking.payment_reference === paymentReference' "$file"
if grep -Fq 'updatePaymentStatus(' "$file"; then
  echo "Unconditional payment status updates are forbidden" >&2; exit 1
fi
echo "Webhook booking payment verification contract passed"
