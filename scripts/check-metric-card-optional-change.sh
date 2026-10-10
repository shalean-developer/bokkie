#!/usr/bin/env bash
set -euo pipefail
component="components/admin/MetricCard.tsx"
page="app/admin/page.tsx"
grep -Fq 'change?: number;' "$component"
grep -Fq 'typeof change === "number" && Number.isFinite(change)' "$component"
grep -Fq 'change.toFixed(2)' "$component"
grep -Fq 'title="Verified Payment-date Revenue"' "$page"
grep -Fq 'title="Historical Paid — Date Unknown"' "$page"
grep -Fq 'title="Lifetime Recorded Payments"' "$page"
echo "BOK-PLESK-15B06E nullable comparison metric guard passed"
