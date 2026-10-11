# BOK-PLESK-15B07R01E-02 — Atomic credit settlement contract

Status: P0 OPEN. This document is a migration prerequisite, not an applied permission change.

## Proved from current code and staging schema
- `app/actions/credits.ts` is a `"use server"` module exporting `addCreditsAfterPayment(userId,amount,paymentMethod,paymentReference,...)`. That exported action has no independent caller authorization or provider verification.
- Credit spending, credit purchases, and EFT approval call `update_credit_balance` before a separate `credit_transactions` write. Some branches report success after ledger write failure.
- `app/actions/submit-booking.ts` spends credits before checking existing bookings and saves recurring visits separately.
- `app/api/credits/verify/route.ts` verifies Paystack before calling the shared mutator, but verification here cannot secure the standalone exported Server Action.
- `update_credit_balance` remains callable by anon/authenticated under current Supabase grants.
- Direct `user_credits` and `credit_transactions` writes remain exposed by table grants/RLS.

## Migration requirements
1. Replace the exposed `addCreditsAfterPayment` Server Action with an internal-only server module; callers must pass independently verified payment facts from trusted routes, never client-provided funding amounts. Do not let any client-accessible action mint credits.
2. Introduce a restricted transactional database settlement primitive that locks the user balance row, checks a unique immutable operation identity, inserts the ledger entry and changes balance in **one transaction**, and returns the previous settled result on retry. No balance change if the ledger insert fails.
3. For Paystack, claim by `(environment, provider, reference, operation type)` and verify amount/currency/status/customer before the DB call. For EFT, require a verified submission and authorised administrator. For credit usage, require `auth.uid()` ownership and a booking-operation identity.
4. Convert existing credit-spend, voucher, Paystack callback, credit-verify route and EFT-approval callers to trusted paths **before** dropping client grants.
5. Tighten direct writes and `update_credit_balance` EXECUTE only after staging smoke tests prove the replacement paths. Do not change unrelated trigger/RPC access.
6. Keep historical records unchanged. Reject replay, concurrent duplicate claims, cross-user operations, insufficient funds and ledger failure. Verify separate Test/Live Paystack environments.

## Acceptance criteria
- Anonymous calls cannot alter balances or credit ledger.
- Authenticated callers cannot fund themselves or another customer by supplying arbitrary values.
- Concurrent replays lead to exactly one ledger operation and one balance movement.
- Failed credit transaction insertion leaves the balance untouched.
- Duplicate booking submission cannot spend credits twice.
- Credit voucher redemption, EFT approval, legitimate recurring bookings and payment recovery continue to work.
- Automatic staging CI, schema migration, SQL permissions check and live staging reconciliation pass before any closure.
- No change to production/Vercel.
