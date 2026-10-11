#!/usr/bin/env python3
"""Staging-only two-session settlement verification. Never run in CI or against production.

Install: pip install "psycopg[binary]"
Set BOKKIE_STAGING_DATABASE_URL privately (never commit or paste credentials).
Run: BOKKIE_RUN_REMOTE_CONCURRENCY=yes python scripts/test-bok-staging-atomic-concurrency.py
Recovery: BOKKIE_CONCURRENCY_CLEANUP_ID=<printed UUID> python ... --cleanup-only
A fixture is temporarily committed, then deleted. Interrupted runs require cleanup-only.
"""
import argparse
import concurrent.futures
import os
import sys
import uuid
from urllib.parse import urlsplit
import psycopg

PROJECT = "scsrxogumimsrtbnqeas"
PREFIX = "bok-concurrency-fixture-"

def connect():
    return psycopg.connect(os.environ["BOKKIE_STAGING_DATABASE_URL"], connect_timeout=10)

def preflight():
    dsn = os.environ.get("BOKKIE_STAGING_DATABASE_URL", "")
    if not dsn.startswith(("postgresql://", "postgres://")):
        raise RuntimeError("Require URL-form staging Postgres DSN")
    url = urlsplit(dsn)
    host = (url.hostname or "").lower()
    username = url.username or ""
    if host not in ("db."+PROJECT+".supabase.co", "aws-0-af-south-1.pooler.supabase.com",
                   "aws-0-eu-west-1.pooler.supabase.com") and not (
                   host.endswith(".pooler.supabase.com") and username.endswith("."+PROJECT)):
        raise RuntimeError("Refusing unrecognised staging host")
    if host.endswith(".pooler.supabase.com") and not username.endswith("."+PROJECT):
        raise RuntimeError("Pooler username must specify exact staging project")
    with connect() as db:
        with db.cursor() as c:
            c.execute("SELECT current_database(), current_user")
            name, role = c.fetchone()
            if name != "postgres":
                raise RuntimeError("Unexpected database name")
            c.execute("SELECT to_regprocedure('public.settle_credit_operation_private(text,uuid,text,numeric,text,text)')")
            if c.fetchone()[0] is None:
                raise RuntimeError("Atomic settlement function unavailable")
    print("PASS staging connection and installed function", flush=True)

def identity(user):
    return PREFIX + str(user)

def cleanup(user):
    marker = identity(user)
    email = marker + "@example.invalid"
    with connect() as db:
        with db.cursor() as c:
            c.execute("SELECT email FROM auth.users WHERE id=%s FOR UPDATE", (user,))
            found = c.fetchone()
            if found is None:
                print("PASS fixture identity absent", flush=True)
                return
            if found[0] != email:
                raise RuntimeError("Refusing cleanup of non-fixture identity")
            c.execute("SELECT COUNT(*) FROM public.credit_settlement_operations WHERE user_id=%s AND operation_key NOT LIKE %s",
                      (user, marker+"%"))
            if c.fetchone()[0]:
                raise RuntimeError("Unexpected operation; refusing cleanup")
            c.execute("SELECT COUNT(*) FROM public.credit_transactions WHERE user_id=%s AND payment_reference IS DISTINCT FROM %s",
                      (user, marker))
            if c.fetchone()[0]:
                raise RuntimeError("Unexpected ledger transaction; refusing cleanup")
            c.execute("DELETE FROM public.credit_settlement_operations WHERE user_id=%s AND operation_key LIKE %s", (user, marker+"%"))
            c.execute("DELETE FROM public.credit_transactions WHERE user_id=%s AND payment_reference=%s", (user, marker))
            c.execute("DELETE FROM auth.users WHERE id=%s AND email=%s", (user,email))
            if c.rowcount != 1:
                raise RuntimeError("Fixture identity deletion failed")
    with connect() as db:
        with db.cursor() as c:
            for table in ("credit_settlement_operations","credit_transactions","user_credits"):
                c.execute("SELECT COUNT(*) FROM public."+table+" WHERE user_id=%s",(user,))
                if c.fetchone()[0] != 0:
                    raise RuntimeError("Residual fixture rows in "+table)
            c.execute("SELECT COUNT(*) FROM auth.users WHERE id=%s",(user,))
            if c.fetchone()[0] != 0:
                raise RuntimeError("Residual synthetic auth identity")
    print("PASS synthetic fixture cleanup", flush=True)

def settle(user,key,kind,amount):
    with connect() as db:
        try:
            with db.cursor() as c:
                c.execute("SELECT transaction_id,resulting_balance,replayed FROM public.settle_credit_operation_private(%s,%s,%s,%s,%s,%s)",
                          (key,user,kind,amount,"card" if kind=="purchase" else None,identity(user)))
                return ("ok", c.fetchone())
        except psycopg.Error as error:
            db.rollback()
            return ("error", error.sqlstate, str(error).splitlines()[0])

def run():
    if os.environ.get("BOKKIE_RUN_REMOTE_CONCURRENCY") != "yes":
        raise RuntimeError("Explicit BOKKIE_RUN_REMOTE_CONCURRENCY=yes required")
    user=uuid.uuid4()
    marker=identity(user)
    # Print and flush recovery identifier before any persistent writes.
    print("RECOVERY FIXTURE ID:",user,flush=True)
    print("If interrupted: set BOKKIE_CONCURRENCY_CLEANUP_ID to this UUID and use --cleanup-only",flush=True)
    try:
        with connect() as db:
            with db.cursor() as c:
                c.execute("""INSERT INTO auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
                           VALUES (%s,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',%s,'',now(),now())""",
                          (user,marker+"@example.invalid"))
                c.execute("SELECT balance FROM public.user_credits WHERE user_id=%s",(user,))
                if c.fetchone() != (0,):
                    raise RuntimeError("Initial synthetic balance not zero")
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            runs=list(pool.map(lambda _:settle(user,marker+"-same","purchase",100),range(2)))
        if any(r[0] != "ok" for r in runs) or sorted(r[1][2] for r in runs) != [False,True] or runs[0][1][0]!=runs[1][1][0]:
            raise RuntimeError("Simultaneous replay test failed: "+repr(runs))
        print("PASS simultaneous identical settlement: one new, one replay",flush=True)
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            pending=[pool.submit(settle,user,marker+"-spend-"+str(i),"usage",80) for i in range(2)]
            runs=[x.result() for x in pending]
        if sum(r[0]=="ok" for r in runs)!=1 or sum(r[0]=="error" and "Insufficient credits" in r[2] for r in runs)!=1:
            raise RuntimeError("Concurrent overspend protection failed: "+repr(runs))
        with connect() as db:
            with db.cursor() as c:
                c.execute("SELECT balance FROM public.user_credits WHERE user_id=%s",(user,))
                if c.fetchone()[0]!=20: raise RuntimeError("Incorrect final synthetic balance")
                for table in ("credit_transactions","credit_settlement_operations"):
                    c.execute("SELECT COUNT(*) FROM public."+table+" WHERE user_id=%s",(user,))
                    if c.fetchone()[0]!=2: raise RuntimeError("Incorrect fixture ledger/operation count")
        print("PASS concurrent R80 spending: one success, one insufficient, R20 remains",flush=True)
    finally:
        cleanup(user)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--cleanup-only",action="store_true")
    args=p.parse_args()
    preflight()
    if args.cleanup_only:
        token=os.environ.get("BOKKIE_CONCURRENCY_CLEANUP_ID")
        if not token: raise RuntimeError("Set BOKKIE_CONCURRENCY_CLEANUP_ID from test output")
        cleanup(uuid.UUID(token))
    else: run()
if __name__=="__main__":
    try: main()
    except Exception as exc:
        print("FAIL:",exc,file=sys.stderr)
        sys.exit(1)
