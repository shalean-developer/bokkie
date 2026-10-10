#!/usr/bin/env bash
set -euo pipefail
page="app/admin/page.tsx"
action="app/actions/admin-dashboard.ts"
grep -Fq 'getPaymentDateReport(start.toISOString(), end.toISOString())' "$action"
grep -Fq 'paymentDateReport,' "$action"
grep -Fq 'title="Verified Payment-date Revenue"' "$page"
grep -Fq 'title="Historical Paid — Date Unknown"' "$page"
grep -Fq 'title="Lifetime Recorded Payments"' "$page"
grep -Fq 'paymentDateReport.undatedHistoricalCount' "$page"
grep -Fq '<RevenueChart data={paymentDateReport.verifiedTrends} />' "$page"
if grep -Fq '<RevenueChart data={revenueTrends} />' "$page"; then exit 1; fi
echo "Payment-date dashboard source of truth contract passed"
