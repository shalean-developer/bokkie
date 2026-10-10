#!/usr/bin/env bash
set -euo pipefail
# Temporary safety gate: reporting code retained, but not wired into admin
# until the staging server-side exception has been identified and fixed.
test -f lib/payments/payment-date-report-server.ts
test -f lib/payments/payment-date-reporting.test.ts
grep -Fq 'export async function getPaymentDateReport' lib/payments/payment-date-report-server.ts
if grep -Fq 'getPaymentDateReport' app/actions/admin-dashboard.ts; then
  echo "Unsafe payment report dashboard integration detected" >&2
  exit 1
fi
if grep -Fq 'paymentDateReport' app/admin/page.tsx; then
  echo "Unsafe payment report rendering detected" >&2
  exit 1
fi
echo "BOK-PLESK-15B06D dashboard rollback isolation contract passed"
