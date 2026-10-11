#!/usr/bin/env bash
set -euo pipefail
f=supabase/migrations/20261011064000_bok_plesk_15b07_r01e02a_atomic_credit_settlement.sql
test -s "$f"
grep -Fq 'operation_key text NOT NULL UNIQUE' "$f"
grep -Fq 'pg_advisory_xact_lock' "$f"
grep -Fq 'FOR UPDATE' "$f"
grep -Fq 'Credit operation replay mismatch' "$f"
grep -Fq 'Insufficient credits' "$f"
grep -Fq "INSERT INTO public.credit_transactions" "$f"
grep -Fq "UPDATE public.user_credits" "$f"
grep -Fq 'ENABLE ROW LEVEL SECURITY' "$f"
grep -Fq 'REVOKE ALL ON FUNCTION public.settle_credit_operation_private' "$f"
grep -Fq 'GRANT EXECUTE ON FUNCTION public.settle_credit_operation_private' "$f"
! grep -E '^GRANT EXECUTE.*TO (anon|authenticated|PUBLIC)' "$f"
! grep -E '^UPDATE public.bookings|^DELETE FROM public.bookings' "$f"
echo 'Private atomic credit settlement contract PASS'
