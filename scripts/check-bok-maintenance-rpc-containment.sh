#!/usr/bin/env bash
set -euo pipefail
file="supabase/migrations/20261010222500_bok_plesk_15b07_r01e01_maintenance_rpc_containment.sql"
test -s "$file"
for signature in 'fix_missing_credits_for_verified_eft()' 'backfill_cleaner_earnings_for_booking(text)' 'assign_voucher_to_user(uuid, text)'; do
  grep -Fq "REVOKE EXECUTE ON FUNCTION public.$signature FROM PUBLIC, anon, authenticated;" "$file"
  grep -Fq "GRANT EXECUTE ON FUNCTION public.$signature TO service_role;" "$file"
done
# Only the three named non-customer maintenance/assignment functions may be revoked here.
test "$(grep -c '^REVOKE EXECUTE ON FUNCTION' "$file")" -eq 3
! grep -E '^REVOKE.*(update_credit_balance|redeem_credit_voucher|purchase_voucher|process_referral_rewards)' "$file"
grep -Fq 'BEGIN;' "$file"
grep -Fq 'COMMIT;' "$file"
echo "Bounded maintenance RPC containment contract passed"
