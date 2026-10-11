-- BOK-PLESK-15B07R01E-01: contain privileged maintenance and voucher assignment RPCs.
-- DDL ONLY. Do not apply until staging caller/dependency verification.
BEGIN;
REVOKE EXECUTE ON FUNCTION public.fix_missing_credits_for_verified_eft() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.backfill_cleaner_earnings_for_booking(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_voucher_to_user(uuid, text) FROM PUBLIC, anon, authenticated;
-- Service-role access for trusted server maintenance is retained.
GRANT EXECUTE ON FUNCTION public.fix_missing_credits_for_verified_eft() TO service_role;
GRANT EXECUTE ON FUNCTION public.backfill_cleaner_earnings_for_booking(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.assign_voucher_to_user(uuid, text) TO service_role;
COMMIT;
