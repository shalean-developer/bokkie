#!/usr/bin/env bash
set -euo pipefail
storage="lib/storage/admin-supabase.ts"
page="app/admin/page.tsx"
metrics="$(sed -n '/^export async function getAdminDashboardMetrics(/,/^export async function getRevenueTrends(/p' "$storage")"
trends="$(sed -n '/^export async function getBookingsTrends(/,/^export async function getServiceBreakdown(/p' "$storage")"
# Both current and prior booking counts, and both customer counts, exclude cancellations.
test "$(grep -Fc '.neq("status", "cancelled")' <<< "$metrics")" -eq 4
grep -Fq '.select("id", { count: "exact", head: true })' <<< "$metrics"
test "$(grep -Fc '.neq("status", "cancelled")' <<< "$trends")" -eq 1
grep -Fq '.select("created_at")' <<< "$trends"
grep -Fq 'b.contact_email?.trim().toLowerCase()).filter(Boolean)' <<< "$metrics"
grep -Fq 'title="Non-cancelled Bookings"' "$page"
grep -Fq 'title="Booking Customers"' "$page"
grep -Fq 'title="Avg Verified Paid Booking Value"' "$page"
grep -Fq 'paymentDateReport.verifiedPeriodRevenue / paymentDateReport.verifiedPeriodCount' "$page"
# Payment accounting stays scoped to completed payments.
test "$(grep -Fc '.eq("payment_status", "completed")' <<< "$metrics")" -eq 2
echo "BOK-PLESK-15A dashboard metric contract passed"
