-- Trusted financial entry points. No existing balances or historical ledger rows are rewritten.
BEGIN;
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
     OR p_amount IS NULL OR p_amount::text IN ('NaN','Infinity','-Infinity') OR p_amount <= 0 OR p_amount <> round(p_amount,2)
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

CREATE TABLE public.credit_payment_intents (
 reference text PRIMARY KEY, user_id uuid NOT NULL REFERENCES auth.users(id),
 email text NOT NULL, amount_cents bigint NOT NULL CHECK(amount_cents BETWEEN 2000 AND 500000),
 environment text NOT NULL CHECK(environment IN ('test','live')), created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_payment_intents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.credit_payment_intents FROM PUBLIC, anon, authenticated;
GRANT SELECT,INSERT ON public.credit_payment_intents TO service_role;

CREATE FUNCTION public.settle_credit_purchase_private(p_reference text,p_environment text)
RETURNS TABLE(transaction_id uuid,resulting_balance numeric,replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v public.credit_payment_intents%ROWTYPE;
BEGIN
 SELECT * INTO STRICT v FROM public.credit_payment_intents WHERE reference=p_reference;
 IF v.environment IS DISTINCT FROM p_environment THEN RAISE EXCEPTION 'Payment environment mismatch'; END IF;
 RETURN QUERY SELECT * FROM public.settle_credit_operation_private(
  'paystack:'||v.environment||':credit:'||v.reference,v.user_id,'purchase',v.amount_cents::numeric/100,'card',v.reference);
END; $$;
REVOKE ALL ON FUNCTION public.settle_credit_purchase_private(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.settle_credit_purchase_private(text,text) TO service_role;

-- Preserve existing administrator flags; stop browser clients changing them.
CREATE FUNCTION public.protect_credit_admin_flag() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF current_user IN ('anon','authenticated') AND (
  (TG_OP='INSERT' AND NEW.is_admin IS TRUE) OR
  (TG_OP='UPDATE' AND NEW.is_admin IS DISTINCT FROM OLD.is_admin)) THEN
  RAISE EXCEPTION 'Administrator flag is server managed';
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER protect_credit_admin_flag BEFORE INSERT OR UPDATE ON public.profiles
 FOR EACH ROW EXECUTE FUNCTION public.protect_credit_admin_flag();

CREATE FUNCTION public.settle_eft_credit_private(p_submission_id uuid,p_admin_id uuid,p_approved boolean,p_rejection_reason text DEFAULT NULL)
RETURNS TABLE(transaction_id uuid,resulting_balance numeric,replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v public.eft_payment_submissions%ROWTYPE; r record;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=p_admin_id AND is_admin IS TRUE) THEN
  RAISE EXCEPTION 'Administrator required';
 END IF;
 IF p_approved IS NULL THEN RAISE EXCEPTION 'Decision required'; END IF;
 SELECT * INTO STRICT v FROM public.eft_payment_submissions WHERE id=p_submission_id FOR UPDATE;
 IF v.status='rejected' OR (v.status='verified' AND NOT p_approved) THEN RAISE EXCEPTION 'Submission already processed'; END IF;
 IF p_approved THEN
  -- Never re-fund a legacy verified submission whose atomic operation is absent.
  IF v.status='verified' AND NOT EXISTS(SELECT 1 FROM public.credit_settlement_operations
   WHERE operation_key='eft:credit:'||v.id::text) THEN RAISE EXCEPTION 'Legacy approval requires reconciliation'; END IF;
  SELECT * INTO r FROM public.settle_credit_operation_private('eft:credit:'||v.id::text,
    v.user_id,'purchase',v.amount,'eft',v.reference_number);
  UPDATE public.eft_payment_submissions SET status='verified',verified_by=p_admin_id,verified_at=COALESCE(verified_at,now()) WHERE id=v.id;
  -- Cancel only the unposted pending placeholder linked to this submission.
  UPDATE public.credit_transactions SET status='cancelled'
   WHERE status='pending' AND user_id=v.user_id AND payment_method='eft'
    AND metadata->>'eft_submission_id'=v.id::text;
  RETURN QUERY SELECT r.transaction_id,r.resulting_balance,r.replayed;
 ELSE
  UPDATE public.eft_payment_submissions SET status='rejected',verified_by=p_admin_id,verified_at=now(),rejection_reason=p_rejection_reason WHERE id=v.id;
  RETURN QUERY SELECT NULL::uuid,NULL::numeric,false;
 END IF;
END; $$;
REVOKE ALL ON FUNCTION public.settle_eft_credit_private(uuid,uuid,boolean,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.settle_eft_credit_private(uuid,uuid,boolean,text) TO service_role;

CREATE TABLE public.credit_booking_requests(
 operation_key text PRIMARY KEY,user_id uuid NOT NULL REFERENCES auth.users(id),
 booking_reference text NOT NULL,request_payload jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_booking_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.credit_booking_requests FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON public.credit_booking_requests TO service_role;
CREATE FUNCTION public.create_credit_bookings_private(p_operation_key text,p_user_id uuid,p_bookings jsonb)
RETURNS TABLE(booking_reference text,replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE existing public.credit_booking_requests%ROWTYPE; payload jsonb; item jsonb;
 first_ref text; total numeric;
BEGIN
 IF p_user_id IS NULL OR p_operation_key NOT LIKE 'booking-credit:'||p_user_id::text||':%'
  OR jsonb_typeof(p_bookings) IS DISTINCT FROM 'array' OR jsonb_array_length(p_bookings) NOT BETWEEN 1 AND 31 THEN
  RAISE EXCEPTION 'Invalid credit booking'; END IF;
 SELECT jsonb_agg(e - 'created_at' ORDER BY ord) INTO payload FROM jsonb_array_elements(p_bookings) WITH ORDINALITY a(e,ord);
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_operation_key,0));
 SELECT * INTO existing FROM public.credit_booking_requests WHERE operation_key=p_operation_key;
 IF FOUND THEN
  IF existing.user_id<>p_user_id OR existing.request_payload IS DISTINCT FROM payload THEN RAISE EXCEPTION 'Booking replay mismatch'; END IF;
  RETURN QUERY SELECT existing.booking_reference,true; RETURN;
 END IF;
 first_ref:=p_bookings->0->>'booking_reference';
 total:=(p_bookings->0->>'total_amount')::numeric;
 IF first_ref IS NULL OR total IS NULL OR total<=0 THEN RAISE EXCEPTION 'Invalid booking price'; END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(p_bookings) LOOP
  IF (item->>'user_id')::uuid IS DISTINCT FROM p_user_id OR (item->>'total_amount')::numeric IS DISTINCT FROM total THEN
   RAISE EXCEPTION 'Booking owner or amount mismatch'; END IF;
  -- Only the first visit is funded. Other visits cannot inherit its paid status.
  IF item->>'booking_reference'<>first_ref AND (item->>'payment_status') IS DISTINCT FROM 'pending' THEN
   RAISE EXCEPTION 'Recurring visits require separate payment'; END IF;
  INSERT INTO public.bookings(id,booking_reference,user_id,service_type,frequency,scheduled_date,scheduled_time,bedrooms,bathrooms,extras,street_address,apt_unit,suburb,city,cleaner_preference,assigned_cleaner_id,team_id,special_instructions,fitted_rooms_count,loose_carpets_count,rooms_furniture_status,office_size,contact_first_name,contact_last_name,contact_email,contact_phone,discount_code,tip_amount,total_amount,subtotal,frequency_discount,discount_code_discount,service_fee,cleaner_earnings,cleaner_earnings_percentage,recurring_group_id,recurring_sequence,parent_booking_id,is_recurring,status,payment_status,payment_reference,created_at)
   SELECT r.id,r.booking_reference,r.user_id,r.service_type,r.frequency,r.scheduled_date,r.scheduled_time,r.bedrooms,r.bathrooms,r.extras,r.street_address,r.apt_unit,r.suburb,r.city,r.cleaner_preference,r.assigned_cleaner_id,r.team_id,r.special_instructions,r.fitted_rooms_count,r.loose_carpets_count,r.rooms_furniture_status,r.office_size,r.contact_first_name,r.contact_last_name,r.contact_email,r.contact_phone,r.discount_code,r.tip_amount,r.total_amount,r.subtotal,r.frequency_discount,r.discount_code_discount,r.service_fee,r.cleaner_earnings,r.cleaner_earnings_percentage,r.recurring_group_id,r.recurring_sequence,r.parent_booking_id,r.is_recurring,r.status,r.payment_status,r.payment_reference,r.created_at FROM jsonb_populate_record(NULL::public.bookings,item) r;
 END LOOP;
 PERFORM public.settle_credit_operation_private(p_operation_key,p_user_id,'usage',total,NULL,first_ref);
 INSERT INTO public.credit_booking_requests(operation_key,user_id,booking_reference,request_payload)
  VALUES(p_operation_key,p_user_id,first_ref,payload);
 RETURN QUERY SELECT first_ref,false;
END; $$;
REVOKE ALL ON FUNCTION public.create_credit_bookings_private(text,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.create_credit_bookings_private(text,uuid,jsonb) TO service_role;

ALTER TABLE public.voucher_usage_history ADD COLUMN ledger_transaction_id uuid REFERENCES public.credit_transactions(id);
CREATE UNIQUE INDEX voucher_usage_credit_ledger_unique ON public.voucher_usage_history(ledger_transaction_id) WHERE ledger_transaction_id IS NOT NULL;

-- Redemption locks the assignment and uses the same ledger/balance transaction.
CREATE OR REPLACE FUNCTION public.redeem_credit_voucher(p_user_id uuid,p_voucher_code text)
RETURNS TABLE(success boolean,message text,credit_amount numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v public.vouchers%ROWTYPE; uv public.user_vouchers%ROWTYPE; settlement record;
BEGIN
 IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM p_user_id THEN RAISE EXCEPTION 'Voucher ownership required'; END IF;
 SELECT * INTO STRICT v FROM public.vouchers WHERE upper(code)=upper(p_voucher_code)
  AND is_active AND voucher_type='credit' AND valid_from<=now() AND (valid_until IS NULL OR valid_until>=now()) FOR SHARE;
 SELECT * INTO STRICT uv FROM public.user_vouchers WHERE user_id=p_user_id AND voucher_id=v.id FOR UPDATE;
 IF uv.is_redeemed THEN RETURN QUERY SELECT false,'Voucher already redeemed'::text,0::numeric; RETURN; END IF;
 -- assignment id is reused after repurchase; assigned_at distinguishes each purchased award.
 SELECT * INTO settlement FROM public.settle_credit_operation_private('voucher:credit:'||uv.id::text||':'||uv.assigned_at::text,p_user_id,'purchase',v.value,NULL,v.code);
 UPDATE public.user_vouchers SET is_redeemed=true,redeemed_at=now() WHERE id=uv.id;
 INSERT INTO public.voucher_usage_history(user_voucher_id,user_id,voucher_id,voucher_code,voucher_type,value,ledger_transaction_id)
  VALUES(uv.id,p_user_id,v.id,v.code,v.voucher_type,v.value,settlement.transaction_id);
 RETURN QUERY SELECT true,'Voucher redeemed'::text,v.value;
END; $$;
REVOKE ALL ON FUNCTION public.redeem_credit_voucher(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.redeem_credit_voucher(uuid,text) TO authenticated;

ALTER FUNCTION public.purchase_voucher(uuid,uuid,text) SET search_path TO public,pg_temp;

-- All purchase entry points verify the provider first, then serialize by reference.
CREATE FUNCTION public.settle_voucher_purchase_private(p_user_id uuid,p_voucher_id uuid,p_reference text)
RETURNS TABLE(success boolean,message text,user_voucher_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE pending public.pending_voucher_purchases%ROWTYPE; result record; existing_id uuid;
BEGIN
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('voucher-purchase:'||p_reference,0));
 SELECT * INTO STRICT pending FROM public.pending_voucher_purchases WHERE payment_reference=p_reference FOR UPDATE;
 IF pending.user_id IS DISTINCT FROM p_user_id OR pending.voucher_id IS DISTINCT FROM p_voucher_id THEN RAISE EXCEPTION 'Voucher intent mismatch'; END IF;
 IF pending.status='completed' THEN
  SELECT id INTO existing_id FROM public.user_vouchers WHERE user_id=p_user_id AND voucher_id=p_voucher_id;
  RETURN QUERY SELECT true,'Voucher already purchased'::text,existing_id; RETURN;
 END IF;
 IF pending.status<>'pending' THEN RAISE EXCEPTION 'Voucher purchase is not pending'; END IF;
 -- Serialize different references purchasing the same assignment.
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('voucher-user:'||p_user_id::text||':'||p_voucher_id::text,0));
 SELECT * INTO result FROM public.purchase_voucher(p_user_id,p_voucher_id,p_reference);
 IF NOT COALESCE(result.success,false) THEN RAISE EXCEPTION 'Voucher purchase failed'; END IF;
 RETURN QUERY SELECT result.success,result.message,result.user_voucher_id;
END; $$;
REVOKE ALL ON FUNCTION public.settle_voucher_purchase_private(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.settle_voucher_purchase_private(uuid,uuid,text) TO service_role;

-- Referral rewards are another route into the same wallet. Verify a real first
-- paid booking and settle both awards in the same transaction as the flags.
CREATE OR REPLACE FUNCTION public.process_referral_rewards(p_referee_id uuid,p_booking_reference text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE referral public.referrals%ROWTYPE; customer_email text; a_tx uuid; b_tx uuid;
BEGIN
 SELECT email INTO STRICT customer_email FROM auth.users WHERE id=p_referee_id;
 IF NOT EXISTS(SELECT 1 FROM public.bookings WHERE booking_reference=p_booking_reference
  AND payment_status='completed' AND status IN ('confirmed','completed')
  AND (user_id=p_referee_id OR lower(contact_email)=lower(customer_email))) THEN
  RAISE EXCEPTION 'Verified paid booking required'; END IF;
 IF (SELECT count(*) FROM public.bookings WHERE lower(contact_email)=lower(customer_email)
  AND payment_status='completed' AND status IN ('confirmed','completed'))<>1 THEN
  RETURN jsonb_build_object('success',true,'message','Not the first paid booking'); END IF;
 SELECT * INTO referral FROM public.referrals WHERE referee_id=p_referee_id FOR UPDATE;
 IF NOT FOUND OR referral.status<>'pending' THEN RETURN jsonb_build_object('success',true,'message','No pending referral'); END IF;
 IF NOT referral.referrer_reward_given THEN
  SELECT transaction_id INTO a_tx FROM public.settle_credit_operation_private('referral:'||referral.id::text||':referrer',referral.referrer_id,'purchase',50,NULL,p_booking_reference);
 END IF;
 IF NOT referral.referee_reward_given THEN
  SELECT transaction_id INTO b_tx FROM public.settle_credit_operation_private('referral:'||referral.id::text||':referee',p_referee_id,'purchase',50,NULL,p_booking_reference);
 END IF;
 UPDATE public.referrals SET status='completed',first_booking_completed_at=now(),first_booking_reference=p_booking_reference,
  referrer_reward_given=true,referee_reward_given=true,
  referrer_reward_transaction_id=COALESCE(a_tx,referrer_reward_transaction_id),
  referee_reward_transaction_id=COALESCE(b_tx,referee_reward_transaction_id),updated_at=now()
  WHERE id=referral.id;
 RETURN jsonb_build_object('success',true,'message','Referral rewards settled');
END; $$;
REVOKE ALL ON FUNCTION public.process_referral_rewards(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.process_referral_rewards(uuid,text) TO service_role;

DO $$ DECLARE signature text; BEGIN
 FOREACH signature IN ARRAY ARRAY['public.fix_missing_credits_for_verified_eft()', 'public.assign_voucher_to_user(uuid,text)'] LOOP
  IF to_regprocedure(signature) IS NOT NULL THEN
   EXECUTE 'REVOKE EXECUTE ON FUNCTION '||signature||' FROM PUBLIC,anon,authenticated';
   EXECUTE 'GRANT EXECUTE ON FUNCTION '||signature||' TO service_role';
  END IF;
 END LOOP;
END $$;

-- Revoke both table- and column-level mutations. SELECT/RLS remain unchanged.
DO $$ DECLARE t text; c record; BEGIN
 FOREACH t IN ARRAY ARRAY['user_credits','credit_transactions','eft_payment_submissions','user_vouchers','voucher_usage_history','pending_voucher_purchases'] LOOP
  EXECUTE format('REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.%I FROM PUBLIC,anon,authenticated',t);
  FOR c IN SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=t LOOP
   EXECUTE format('REVOKE INSERT(%I),UPDATE(%I),REFERENCES(%I) ON public.%I FROM PUBLIC,anon,authenticated',c.column_name,c.column_name,c.column_name,t);
  END LOOP;
 END LOOP;
END $$;
REVOKE EXECUTE ON FUNCTION public.update_credit_balance(uuid,numeric,text) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.purchase_voucher(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_voucher(uuid,uuid,text) TO service_role;
COMMIT;
