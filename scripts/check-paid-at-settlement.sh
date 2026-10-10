#!/usr/bin/env bash
set -euo pipefail
test -f supabase/migrations/20261010182000_bok_plesk_15b01_add_paid_at.sql
grep -Fq 'ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ' supabase/migrations/20261010182000_bok_plesk_15b01_add_paid_at.sql
for file in app/actions/book-v2.ts lib/payments/rebook-settlement.ts; do
  grep -Fq 'verifiedPaidAt(' "$file"
  grep -Fq 'paid_at: paidAt' "$file"
  grep -Fq '.neq("payment_status", "completed")' "$file"
done
head -n 1 app/actions/book-v2.ts | grep -Fq '"use server";'
echo "Verified payment timestamp contract passed"
