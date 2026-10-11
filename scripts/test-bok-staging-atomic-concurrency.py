#!/usr/bin/env python3
"""BOK-PLESK-15B07R01E-02B05B — two-session remote staging concurrency fixture.

Requires: pip install "psycopg[binary]"
Env: BOKKIE_STAGING_DATABASE_URL (direct/session-pooler Postgres DSN), BOKKIE_RUN_REMOTE_CONCURRENCY=yes
Never run against production. Never copy database credentials into repository.
The fixture commits synthetic records for cross-session visibility; finally cleans them.
"""
import os, uuid, concurrent.futures
import psycopg

DSN=os.environ.get("BOKKIE_STAGING_DATABASE_URL")
if os.environ.get("BOKKIE_RUN_REMOTE_CONCURRENCY")!="yes" or not DSN:
    raise SystemExit("Set explicit staging URL and BOKKIE_RUN_REMOTE_CONCURRENCY=yes")
if "scsrxogumimsrtbnqeas" not in DSN:
    raise SystemExit("Refusing DSN without exact Bokkie staging project ref")

user=uuid.uuid4()
marker="bok-concurrency-fixture-"+str(user)
email=marker+"@example.invalid"
def connection(): return psycopg.connect(DSN,connect_timeout=15)
def one(key,kind,amount):
    with connection() as conn:
        with conn.cursor() as c:
            try:
                c.execute("SELECT transaction_id,resulting_balance,replayed FROM public.settle_credit_operation_private(%s,%s,%s,%s,%s,%s)",(key,user,kind,amount,"card" if kind=="purchase" else None,marker))
                return ("ok",c.fetchone())
            except psycopg.Error as e:
                conn.rollback()
                return ("error",str(e).splitlines()[0])

try:
    with connection() as conn:
        with conn.cursor() as c:
            c.execute("""INSERT INTO auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
            VALUES(%s,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',%s,'',now(),now())""",(user,email))
            c.execute("SELECT balance FROM public.user_credits WHERE user_id=%s",(user,))
            assert c.fetchone()[0]==0
    shared=marker+"-same"
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        results=list(pool.map(lambda _:one(shared,"purchase",100),range(2)))
    assert all(t=="ok" for t,_ in results),results
    assert sorted([bool(x[2]) for _,x in results])==[False,True],results
    assert len({str(x[0]) for _,x in results})==1,results
    print("PASS same-key simultaneous calls: exactly one first settlement, one replay")
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        futures=[pool.submit(one,marker+"-spend-"+str(i),"usage",80) for i in range(2)]
        spends=[f.result() for f in futures]
    assert sum(t=="ok" for t,_ in spends)==1,spends
    assert sum(t=="error" and "Insufficient credits" in str(x) for t,x in spends)==1,spends
    with connection() as conn:
        with conn.cursor() as c:
            c.execute("SELECT balance FROM public.user_credits WHERE user_id=%s",(user,))
            assert c.fetchone()[0]==20
            c.execute("SELECT COUNT(*) FROM public.credit_transactions WHERE user_id=%s",(user,))
            assert c.fetchone()[0]==2
            c.execute("SELECT COUNT(*) FROM public.credit_settlement_operations WHERE user_id=%s",(user,))
            assert c.fetchone()[0]==2
    print("PASS two different R80 spends: one succeeds, one rejects, balance R20, two total ledger rows")
finally:
    # Delete only fixture-linked rows and only the synthetic identity generated above.
    with connection() as conn:
        with conn.cursor() as c:
            c.execute("DELETE FROM public.credit_settlement_operations WHERE user_id=%s AND operation_key LIKE %s",(user,marker+"%"))
            c.execute("DELETE FROM public.credit_transactions WHERE user_id=%s AND payment_reference=%s",(user,marker))
            c.execute("DELETE FROM auth.users WHERE id=%s AND email=%s",(user,email))
            c.execute("SELECT COUNT(*) FROM public.credit_settlement_operations WHERE user_id=%s",(user,))
            assert c.fetchone()[0]==0
            c.execute("SELECT COUNT(*) FROM public.credit_transactions WHERE user_id=%s",(user,))
            assert c.fetchone()[0]==0
            c.execute("SELECT COUNT(*) FROM auth.users WHERE id=%s",(user,))
            assert c.fetchone()[0]==0
    print("PASS synthetic fixture cleanup")
