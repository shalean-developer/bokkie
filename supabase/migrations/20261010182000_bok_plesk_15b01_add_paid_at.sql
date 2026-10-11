-- BOK-PLESK-15B01: additive payment-completion timestamp.
-- Apply to Bokkie staging (scsrxogumimsrtbnqeas) before deploying settlement
-- code that writes paid_at. Existing historical payments are not backfilled.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

COMMENT ON COLUMN public.bookings.paid_at IS
  'Verified payment completion time (UTC absolute timestamp); NULL for unpaid or unverified historical payments. Do not infer from booking creation/update time.';
