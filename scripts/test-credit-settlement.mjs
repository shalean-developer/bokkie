// Executes the real migrations on disposable embedded PostgreSQL. No hosted data.
import { PGlite } from '@electric-sql/pglite';
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const db = new PGlite();
const user='11111111-1111-4111-a111-111111111111';
const other='22222222-2222-4222-a222-222222222222';
const admin='33333333-3333-4333-a333-333333333333';
const voucher='44444444-4444-4444-a444-444444444444';
const eft='55555555-5555-4555-a555-555555555555';
let checks=0;
async function ok(name, fn){await fn();checks++;console.log('PASS',name);}
async function rejects(sql, params=[]){await assert.rejects(db.query(sql,params));}
async function balance(){return Number((await db.query('select balance from user_credits where user_id=$1',[user])).rows[0].balance);}
try {
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
  CREATE SCHEMA auth;
  CREATE TABLE auth.users(id uuid PRIMARY KEY,email text);
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
  GRANT USAGE ON SCHEMA auth,public TO anon,authenticated,service_role;
  CREATE TABLE public.profiles(id uuid PRIMARY KEY,is_admin boolean DEFAULT false);
  CREATE TABLE public.referrals(id uuid PRIMARY KEY,referee_id uuid,referrer_id uuid,status text,referrer_reward_given boolean DEFAULT false,referee_reward_given boolean DEFAULT false,first_booking_completed_at timestamptz,first_booking_reference text,referrer_reward_transaction_id uuid,referee_reward_transaction_id uuid,updated_at timestamptz);
  CREATE TABLE public.user_credits(user_id uuid PRIMARY KEY REFERENCES auth.users(id),balance numeric(10,2) NOT NULL CHECK(balance>=0),updated_at timestamptz DEFAULT now());
  CREATE TABLE public.credit_transactions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES auth.users(id),transaction_type text NOT NULL,amount numeric(10,2) NOT NULL,balance_before numeric(10,2) NOT NULL,balance_after numeric(10,2) NOT NULL,payment_method text,payment_reference text,status text,metadata jsonb,created_at timestamptz DEFAULT now());
  CREATE TABLE public.eft_payment_submissions(id uuid PRIMARY KEY,user_id uuid,amount numeric,reference_number text,status text,verified_by uuid,verified_at timestamptz,rejection_reason text);
  CREATE TABLE public.vouchers(id uuid PRIMARY KEY,code text,voucher_type text,value numeric,is_active boolean,valid_from timestamptz,valid_until timestamptz,purchase_price numeric,title text);
  CREATE TABLE public.user_vouchers(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,voucher_id uuid,is_redeemed boolean,redeemed_at timestamptz,assigned_at timestamptz DEFAULT now(),UNIQUE(user_id,voucher_id));
  CREATE TABLE public.voucher_usage_history(id uuid DEFAULT gen_random_uuid(),user_voucher_id uuid,user_id uuid,voucher_id uuid,voucher_code text,voucher_type text,value numeric);
  CREATE TABLE public.pending_voucher_purchases(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,voucher_id uuid,payment_reference text UNIQUE,amount numeric,status text,updated_at timestamptz);
  CREATE FUNCTION public.update_credit_balance(uuid,numeric,text) RETURNS numeric LANGUAGE sql AS $$SELECT 0::numeric$$;
 `);
 // Project booking columns with their native fixture types. Extra table defaults
 // ensure the migration's explicit insert doesn't overwrite unrelated columns.
 const src=await readFile('lib/storage/bookings-supabase.ts','utf8');
 const names=[...src.split('/**')[0].matchAll(/^      ([a-z_]+):/gm)].map(m=>m[1]);names.splice(2,0,'user_id');
 const numerics=new Set(['bedrooms','bathrooms','fitted_rooms_count','loose_carpets_count','tip_amount','total_amount','subtotal','frequency_discount','discount_code_discount','service_fee','cleaner_earnings','cleaner_earnings_percentage','recurring_sequence']);
 await db.exec('CREATE TABLE public.bookings('+names.map(c=>c+' '+(c==='user_id'?'uuid':c==='is_recurring'?'boolean':c==='extras'?'text[]':numerics.has(c)?'numeric':'text')+(c==='id'?' PRIMARY KEY':c==='booking_reference'?' UNIQUE':'')).join(',')+",untouched_default text DEFAULT 'preserved')");
 const legacy=await readFile('supabase/migrations/014_fix_voucher_purchase_check.sql','utf8');await db.exec(legacy.slice(legacy.indexOf('CREATE OR REPLACE FUNCTION')));
 await db.exec(await readFile('supabase/migrations/20261011064000_bok_plesk_15b07_r01e02a_atomic_credit_settlement.sql','utf8'));
 // Start with the old broad grants, including a column grant that must be removed.
 await db.exec('GRANT ALL ON ALL TABLES IN SCHEMA public TO anon,authenticated,service_role; GRANT UPDATE(balance) ON user_credits TO authenticated;');
 const migration=(await readdir('supabase/migrations')).find(n=>n.endsWith('_bok_credit_settlement_trusted_paths.sql'));
 await db.exec(await readFile('supabase/migrations/'+migration,'utf8'));
 await db.query('INSERT INTO auth.users VALUES($1,$2),($3,$4),($5,$6)',[user,'owner@example.com',other,'other@example.com',admin,'admin@example.com']);
 await db.query('INSERT INTO profiles VALUES($1,false),($2,false),($3,true)',[user,other,admin]);
 await db.query('INSERT INTO user_credits(user_id,balance) VALUES($1,0)',[user]);
 await db.query('INSERT INTO credit_payment_intents(reference,user_id,email,amount_cents,environment) VALUES($1,$2,$3,10000,$4)',['credit-fixture',user,'owner@example.com','test']);
 const purchase=()=>db.query("SELECT * FROM settle_credit_purchase_private('credit-fixture','test')");
 await ok('funding and sequential provider replay create exactly one ledger movement',async()=>{
  assert.equal((await purchase()).rows[0].replayed,false);assert.equal((await purchase()).rows[0].replayed,true);assert.equal(await balance(),100);
  assert.equal((await db.query('SELECT count(*)::int n FROM credit_transactions')).rows[0].n,1);
 });
 await ok('wrong environment and replay mismatch do not move funds',async()=>{
  await rejects("SELECT * FROM settle_credit_purchase_private('credit-fixture','live')");
  await rejects("SELECT * FROM settle_credit_operation_private('paystack:test:credit:credit-fixture',$1,'purchase',99,'card','credit-fixture')",[other]);
  assert.equal(await balance(),100);
 });
 await ok('NaN and infinite credit values are rejected',async()=>{
  for(const n of ['NaN','Infinity','-Infinity'])await rejects("SELECT * FROM settle_credit_operation_private('invalid-amount',$1,'purchase',$2::numeric,NULL,NULL)",[user,n]);
 });
 await ok('ledger insertion failure rolls the balance back',async()=>{
  await db.exec("ALTER TABLE credit_transactions ADD CONSTRAINT reject_fixture_amount CHECK(amount<>13)");
  await rejects("SELECT * FROM settle_credit_operation_private('ledger-failure',$1,'purchase',13,NULL,NULL)",[user]);assert.equal(await balance(),100);
  await db.exec('ALTER TABLE credit_transactions DROP CONSTRAINT reject_fixture_amount');
 });
 const booking={id:'fixture-booking',booking_reference:'BOK-FIXTURE',user_id:user,total_amount:30,payment_status:'completed',status:'confirmed',is_recurring:false,extras:[]};
 const key='booking-credit:'+user+':fixture';
 const book=(payload=[booking],op=key)=>db.query('SELECT * FROM create_credit_bookings_private($1,$2,$3::jsonb)',[op,user,JSON.stringify(payload)]);
 await ok('booking persistence, debit and retries share one transaction',async()=>{
  assert.equal((await book()).rows[0].replayed,false);assert.equal(await balance(),70);
  assert.equal((await book()).rows[0].replayed,true);assert.equal(await balance(),70);
  assert.equal((await db.query('select untouched_default from bookings')).rows[0].untouched_default,'preserved');
 });
 await ok('changed booking replay is rejected',()=>rejects('SELECT * FROM create_credit_bookings_private($1,$2,$3::jsonb)',[key,user,JSON.stringify([{...booking,total_amount:31}])]));
 await ok('insufficient funds leave no orphan booking',async()=>{
  await rejects('SELECT * FROM create_credit_bookings_private($1,$2,$3::jsonb)',[key+'-over',user,JSON.stringify([{...booking,id:'over',booking_reference:'OVER',total_amount:999}])]);
  assert.equal((await db.query("SELECT count(*)::int n FROM bookings WHERE id='over'")).rows[0].n,0);assert.equal(await balance(),70);
 });
 await ok('one failing recurring visit rolls the entire group and debit back',async()=>{
  await rejects('SELECT * FROM create_credit_bookings_private($1,$2,$3::jsonb)',[key+'-bad',user,JSON.stringify([{...booking,id:'new',booking_reference:'NEW'}, {...booking,payment_status:'pending'}])]);
  assert.equal((await db.query("SELECT count(*)::int n FROM bookings WHERE id='new'")).rows[0].n,0);assert.equal(await balance(),70);
 });
 await ok('unfunded recurring visits remain pending',async()=>{
  const group=[{...booking,id:'rec1',booking_reference:'REC1',total_amount:10},{...booking,id:'rec2',booking_reference:'REC2',total_amount:10,payment_status:'pending',status:'pending'}];
  await book(group,key+'-rec');assert.equal(await balance(),60);assert.equal((await db.query("select payment_status from bookings where id='rec2'")).rows[0].payment_status,'pending');
 });
 await db.query("INSERT INTO eft_payment_submissions(id,user_id,amount,reference_number,status) VALUES($1,$2,20,'EFT-FIXTURE','pending')",[eft,user]);
 await ok('non-admin EFT approval is denied',()=>rejects('SELECT * FROM settle_eft_credit_private($1,$2,true,NULL)',[eft,other]));
 await ok('EFT approval retry funds exactly once',async()=>{
  assert.equal((await db.query('SELECT * FROM settle_eft_credit_private($1,$2,true,NULL)',[eft,admin])).rows[0].replayed,false);
  assert.equal((await db.query('SELECT * FROM settle_eft_credit_private($1,$2,true,NULL)',[eft,admin])).rows[0].replayed,true);assert.equal(await balance(),80);
 });
 await db.query("INSERT INTO vouchers VALUES($1,'FIXTURE','credit',25,true,now()-interval '1 day',NULL,20,'Fixture')",[voucher]);
 await db.query('INSERT INTO user_vouchers(user_id,voucher_id,is_redeemed) VALUES($1,$2,false)',[user,voucher]);
 await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[other]);
 await ok('cross-user voucher redemption is denied',()=>rejects("SELECT * FROM redeem_credit_voucher($1,'FIXTURE')",[user]));
 await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[user]);
 await ok('voucher redemption writes ledger and cannot be replayed',async()=>{
  assert.equal((await db.query("SELECT * FROM redeem_credit_voucher($1,'FIXTURE')",[user])).rows[0].success,true);
  assert.equal((await db.query("SELECT * FROM redeem_credit_voucher($1,'FIXTURE')",[user])).rows[0].success,false);assert.equal(await balance(),105);
 });
 await ok('EFT ledger failure leaves approval pending and balance unchanged',async()=>{
  const bad='66666666-6666-4666-a666-666666666666';
  await db.query("INSERT INTO eft_payment_submissions(id,user_id,amount,reference_number,status) VALUES($1,$2,13,'BAD-EFT','pending')",[bad,user]);
  await db.exec('ALTER TABLE credit_transactions ADD CONSTRAINT reject_eft_fixture CHECK(amount<>13)');
  await rejects('SELECT * FROM settle_eft_credit_private($1,$2,true,NULL)',[bad,admin]);
  assert.equal((await db.query('SELECT status FROM eft_payment_submissions WHERE id=$1',[bad])).rows[0].status,'pending');assert.equal(await balance(),105);
  await db.exec('ALTER TABLE credit_transactions DROP CONSTRAINT reject_eft_fixture');
 });
 await ok('voucher purchase retries do not reset a redeemed assignment',async()=>{
  await db.query("INSERT INTO pending_voucher_purchases(user_id,voucher_id,payment_reference,amount,status) VALUES($1,$2,'voucher-fixture',20,'pending')",[user,voucher]);
  assert.equal((await db.query("SELECT * FROM settle_voucher_purchase_private($1,$2,'voucher-fixture')",[user,voucher])).rows[0].success,true);
  await db.exec('ALTER TABLE credit_transactions ADD CONSTRAINT reject_voucher_fixture CHECK(amount<>25) NOT VALID');
  await rejects("SELECT * FROM redeem_credit_voucher($1,'FIXTURE')",[user]);
  assert.equal((await db.query('SELECT is_redeemed FROM user_vouchers WHERE user_id=$1',[user])).rows[0].is_redeemed,false);assert.equal(await balance(),105);
  await db.exec('ALTER TABLE credit_transactions DROP CONSTRAINT reject_voucher_fixture');
  assert.equal((await db.query("SELECT * FROM redeem_credit_voucher($1,'FIXTURE')",[user])).rows[0].success,true);
  await db.query("SELECT * FROM settle_voucher_purchase_private($1,$2,'voucher-fixture')",[user,voucher]);
  assert.equal((await db.query('SELECT is_redeemed FROM user_vouchers WHERE user_id=$1',[user])).rows[0].is_redeemed,true);assert.equal(await balance(),130);
 });
 await ok('referral requires a real paid booking',()=>rejects("SELECT process_referral_rewards($1,'missing')",[user]));
 await ok('referral awards and flags settle once',async()=>{
  const ref='77777777-7777-4777-a777-777777777777';
  await db.query("INSERT INTO referrals(id,referee_id,referrer_id,status) VALUES($1,$2,$3,'pending')",[ref,other,user]);
  await db.query("INSERT INTO bookings(id,booking_reference,user_id,contact_email,payment_status,status) VALUES('ref','REF',$1,'other@example.com','completed','confirmed')",[other]);
  await db.query("SELECT process_referral_rewards($1,'REF')",[other]);
  await db.query("SELECT process_referral_rewards($1,'REF')",[other]);assert.equal(await balance(),180);
  assert.equal(Number((await db.query('SELECT balance FROM user_credits WHERE user_id=$1',[other])).rows[0].balance),50);
 });
 await ok('anonymous and customer roles cannot mutate financial tables or call privileged RPCs',async()=>{
  for(const role of ['anon','authenticated']) {
   await db.exec('SET ROLE '+role);
   for(const table of ['user_credits','credit_transactions','user_vouchers','pending_voucher_purchases','eft_payment_submissions'])await rejects('DELETE FROM '+table);
   await rejects("UPDATE user_credits SET balance=99999");await rejects("SELECT update_credit_balance($1,999,'purchase')",[user]);
   await rejects("SELECT * FROM settle_credit_purchase_private('credit-fixture','test')");
   await rejects('SELECT * FROM settle_eft_credit_private($1,$2,true,NULL)',[eft,admin]);
   await rejects("SELECT process_referral_rewards($1,'REF')",[other]);
   await rejects('SELECT * FROM purchase_voucher($1,$2,\'fake\')',[user,voucher]);
   await db.exec('RESET ROLE');
  }
 });
 await ok('a customer cannot promote their profile to approve EFTs',async()=>{
  await db.exec('SET ROLE authenticated');await rejects('UPDATE profiles SET is_admin=true WHERE id=$1',[other]);await db.exec('RESET ROLE');
 });
 console.log(`${checks} PostgreSQL financial/security checks passed (concurrent backends require hosted rehearsal).`);
} catch(error) { console.error("FAIL",error.message);process.exitCode=1; } finally {await db.close();}
