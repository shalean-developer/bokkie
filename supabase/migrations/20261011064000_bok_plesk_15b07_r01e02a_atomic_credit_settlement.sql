-- BOK-PLESK-15B07R01E-02A: additive, service-role-only atomic credit settlement.
-- This migration does not alter existing balances, bookings, or legacy grants.
BEGIN;
CREATE TABLE IF NOT EXISTS public.credit_settlement_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_key text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase','usage','refund')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  payment_method text CHECK (payment_method IN ('card','eft')),
  payment_reference text,
  ledger_transaction_id uuid NOT NULL UNIQUE REFERENCES public.credit_transactions(id),
  resulting_balance numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_settlement_operations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.credit_settlement_operations FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.credit_settlement_operations TO service_role;
CREATE OR REPLACE FUNCTION public.settle_credit_operation_private(
  p_operation_key text, p_user_id uuid, p_type text, p_amount numeric,
  p_method text DEFAULT NULL, p_reference text DEFAULT NULL
) RETURNS TABLE (transaction_id uuid, resulting_balance numeric, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_existing public.credit_settlement_operations%ROWTYPE;
  v_before numeric;
  v_after numeric;
  v_tx uuid;
BEGIN
  IF p_operation_key IS NULL OR length(trim(p_operation_key)) < 8
     OR length(p_operation_key) > 240 OR p_user_id IS NULL
     OR p_type NOT IN ('purchase','usage','refund') OR p_type IS NULL
     OR p_amount IS NULL OR p_amount <= 0 OR p_amount <> round(p_amount,2)
     OR (p_method IS NOT NULL AND p_method NOT IN ('card','eft')) THEN
    RAISE EXCEPTION 'Invalid credit settlement operation';
  END IF;
  -- Serialise settlement/replay by operation identity, even before the row exists.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_operation_key,0));
  SELECT * INTO v_existing FROM public.credit_settlement_operations
  WHERE operation_key = p_operation_key;
  IF FOUND THEN
    IF v_existing.user_id <> p_user_id OR v_existing.transaction_type <> p_type
       OR v_existing.amount <> p_amount
       OR v_existing.payment_method IS DISTINCT FROM p_method
       OR v_existing.payment_reference IS DISTINCT FROM p_reference THEN
      RAISE EXCEPTION 'Credit operation replay mismatch';
    END IF;
    RETURN QUERY SELECT v_existing.ledger_transaction_id, v_existing.resulting_balance, true;
    RETURN;
  END IF;
  -- Row lock ensures concurrent different operations cannot overspend.
  SELECT balance INTO v_before FROM public.user_credits
  WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.user_credits(user_id,balance)
      VALUES(p_user_id,0) ON CONFLICT (user_id) DO NOTHING;
    SELECT balance INTO v_before FROM public.user_credits
    WHERE user_id = p_user_id FOR UPDATE;
  END IF;
  IF v_before IS NULL THEN RAISE EXCEPTION 'Credit balance unavailable'; END IF;
  v_after := v_before + CASE WHEN p_type = 'usage' THEN -p_amount ELSE p_amount END;
  IF v_after < 0 THEN RAISE EXCEPTION 'Insufficient credits'; END IF;
  INSERT INTO public.credit_transactions (
    user_id,transaction_type,amount,balance_before,balance_after,
    payment_method,payment_reference,status,metadata
  ) VALUES (
    p_user_id,p_type,p_amount,v_before,v_after,p_method,p_reference,'completed',
    pg_catalog.jsonb_build_object('type','atomic_credit_settlement','operation_key',p_operation_key)
  ) RETURNING id INTO v_tx;
  UPDATE public.user_credits SET balance = v_after,updated_at = now()
    WHERE user_id = p_user_id;
  INSERT INTO public.credit_settlement_operations(
    operation_key,user_id,transaction_type,amount,payment_method,
    payment_reference,ledger_transaction_id,resulting_balance
  ) VALUES (p_operation_key,p_user_id,p_type,p_amount,p_method,p_reference,v_tx,v_after);
  RETURN QUERY SELECT v_tx,v_after,false;
END;
$$;
REVOKE ALL ON FUNCTION public.settle_credit_operation_private(text,uuid,text,numeric,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_credit_operation_private(text,uuid,text,numeric,text,text) TO service_role;
COMMIT;
