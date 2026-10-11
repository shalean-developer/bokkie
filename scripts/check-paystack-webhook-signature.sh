#!/usr/bin/env bash
set -euo pipefail
file=app/api/payment/callback/route.ts
grep -Fq 'if (!signature || !verifyWebhookSignature(rawBody, signature, secretKey))' "$file"
if grep -Fq 'if (signature) {' "$file"; then echo 'Unsigned webhook acceptance is forbidden' >&2; exit 1; fi
grep -Fq 'status: 401' "$file"
echo 'Paystack webhook signature fail-closed contract passed'
