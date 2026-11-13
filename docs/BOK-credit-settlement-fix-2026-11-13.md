# Bokkie trusted credit settlement

Status: source remediation prepared; NOT APPLIED to a hosted database and NOT DEPLOYED.

## Production blocker found during migration audit

Both `bokkiecleaning.co.za`'s browser bundle and the Plesk environment endpoint
identify Supabase project `scsrxogumimsrtbnqeas`. The Plesk label `staging` does
not establish database isolation. Do not run synthetic financial writes or apply
this migration there as a staging experiment. The currently connected Supabase
accounts cannot access that project.

Plesk currently serves source `4ee77aa8c51bdcffaa354738595d942cfd7fd694`, via
`deploy/staging` bundle `0aef2aebfc9149ea482a3bff103fe885bd7f9970`. That source
is 148 commits ahead of `main`; do not replace it with main during migration.

## Resulting behavior

- Remove the externally callable arbitrary funding and spending Server Actions.
- Save a server-owned purchase intent. Re-fetch Paystack's transaction and require
  matching reference, exact amount, ZAR currency, test/live domain and customer
  email before calling a restricted database settlement function.
- Browser verification and signed webhooks share the same idempotent settlement.
- EFT approval locks its submission and commits administrator authorization,
  posted ledger entry, balance and approval status in one transaction. A failure
  leaves the submission pending. Old verified submissions without an atomic
  settlement record require reconciliation, never automatic re-funding.
- Save a credit-paid booking and all recurring visits in the same database
  transaction as the debit. Identical customer/form submissions reuse a stable
  operation identity. Completed retries are resolved before availability/pricing
  checks. One failed visit insert rolls the entire group and debit back.
- A checkout charges the displayed first-visit amount. Subsequent recurring
  visits remain pending payment; one payment must not mark all future visits paid.
- Preserve cleaner-earnings calculations, booking emails and discount recording.
  Referral rewards are restricted to a real first paid booking and atomically
  settle their balances, ledger entries and completion flags.
- Voucher purchases require provider verification; redemption locks the
  assignment and links its history to the new ledger row. Reports count that
  award once and do not classify it as cash received.
- Revoke table- and column-level customer/anonymous financial writes and legacy
  mutation RPC access. Preserve read access/RLS and existing posted history.
  Existing administrator flags remain; browser clients cannot change them.

Previously initiated credit payments without a saved intent are rejected for
manual reconciliation. Do not fabricate intents or replay historical payments.

## Validation

`npm run test:credits` covers payment matching and executes the actual SQL
migrations against disposable embedded PostgreSQL. Additional existing financial
reporting tests cover the historical credit fixture and the new linked awards.
The SQL fixtures model repository schemas; they are not a substitute for checking
the exact hosted schema, triggers, grants and existing function definitions.

Verified: replay, changed-owner/environment rejection, invalid numbers, failed
ledger rollback, booking failure rollback, insufficient funds, recurring pending
payments, EFT authorization and approval rollback, voucher ownership/purchase
replay/redemption rollback, referral gating, and table/column/RPC permission denial.

The local Next.js production build uses dummy configuration for compile checks;
it is not a deployable financial runtime. System TLS certificates are enabled
for fetching Google Fonts. The repository already ignores TypeScript build
errors. Full `tsc` still encounters pre-existing sample/metadata/type errors; the
changed source paths have no reported errors in the focused diagnostic review.

Outstanding: actual independent-backend concurrency, schema verification,
authenticated hosted journeys, test-provider payments and delivery verification.
No live payment or customer email was sent. No GitHub Actions build was triggered.

## Controlled rollout

1. Obtain access to the Bokkie project and verify its production designation,
   schema, grants, trigger dependencies and recoverable backup.
2. Provision/identify an independent test database with synthetic users. Build
   with that database's public URL/key; do not reuse the existing bundle's baked
   public values. Keep test Paystack credentials and outbound email disabled.
3. Apply the prior additive atomic primitive and this migration to the test
   database; check advisors, role permissions and exact-schema compatibility.
4. Run the two-session concurrency rehearsal, forced failure tests, complete
   customer/admin credit, voucher, EFT and booking journeys, then reconcile.
5. Prepare coordinated production application/database activation and rollback.
   Revoking old grants while Vercel's old credit code remains in traffic would
   break legitimate purchases. Upgrade all active callers first or use an
   explicitly scheduled maintenance window. Do not simply point DNS at the
   current staging database/configuration.
6. Only after verified acceptance, activate production Plesk, switch the domain,
   verify payments/login/email and disconnect Vercel after propagation.

Decision: NO-GO for production cutover pending independent hosted verification.
