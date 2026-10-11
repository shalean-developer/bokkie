#!/usr/bin/env bash
set -euo pipefail
file=lib/payments/rebook-settlement.ts
matcher=lib/payments/transaction-match.ts
grep -Fq 'matchesBookingPayment(tx, bookingReference, paymentReference, Number(booking.total_amount))' "$file"
grep -Fq 'resolveCompletedPayment(booking.payment_reference, paymentReference) === "same"' "$file"
grep -Fq '.neq("payment_status", "completed")' "$file"
grep -Fq 'tx.metadata?.booking_reference === bookingReference' "$matcher"
grep -Fq 'tx.amount === cents' "$matcher"
grep -Fq 'tx.currency === "ZAR"' "$matcher"
grep -Fq 'booking.user_id !== user.id' app/actions/rebook-payment.ts
grep -Fq '@/lib/payments/rebook-settlement' app/api/payment/callback/route.ts
if grep -Fq 'updatePaymentStatus(' "$file"; then exit 1; fi
echo "Webhook settlement verification contract passed"
