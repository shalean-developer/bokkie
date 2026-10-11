#!/usr/bin/env bash
set -euo pipefail
file="components/book/steps/PaymentStep.tsx"
grep -Fq 'Verify Existing Payment' "$file"
grep -Fq 'verifyAndCompleteBookPayment(bookingReference, paymentReference)' "$file"
grep -Fq 'const bookingReference = recoveryBookingReference.trim()' "$file"
grep -Fq 'const paymentReference = recoveryPaymentReference.trim()' "$file"
grep -Fq 'if (!isAuthenticated || recoveryLoading) return' "$file"
grep -Fq 'clearBookState();' "$file"
# Existing transaction verification must not initiate a new Paystack checkout.
function_body="$(sed -n '/^  const handleRecoverPayment = async () => {/,/^  };$/p' "$file")"
if grep -Eq 'initializePaystack|initializeBookPayment|handlePay\(' <<< "$function_body"; then
  echo "Recovery must not initiate checkout" >&2
  exit 1
fi
echo "Existing-payment recovery contract passed"
