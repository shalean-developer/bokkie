import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeCreditMovements, type CreditLedgerRow } from "./credit-movement-reporting";

const rows: CreditLedgerRow[] = [
  {id:"p1", transaction_type:"purchase",status:"completed",amount:"100",balance_before:"0",balance_after:"100"},
  {id:"p2", transaction_type:"purchase",status:"completed",amount:"1000",balance_before:"100",balance_after:"1100"},
  {id:"p3", transaction_type:"purchase",status:"completed",amount:"2000",balance_before:"1100",balance_after:"3100"},
  {id:"u1", transaction_type:"usage",status:"completed",amount:"653.25",balance_before:"3150",balance_after:"2496.75"},
  {id:"u2", transaction_type:"usage",status:"completed",amount:"583",balance_before:"2496.75",balance_after:"1913.75"},
  {id:"u3", transaction_type:"usage",status:"completed",amount:"485",balance_before:"1913.75",balance_after:"1428.75"},
  {id:"u4", transaction_type:"usage",status:"completed",amount:"462",balance_before:"1428.75",balance_after:"966.75"},
  {id:"u5", transaction_type:"usage",status:"completed",amount:"462",balance_before:"966.75",balance_after:"504.75"},
  {id:"u6", transaction_type:"usage",status:"completed",amount:"440",balance_before:"504.75",balance_after:"64.75"}
];
const voucher = [{id:"voucher-redemption-1",voucher_type:"credit",value:"50"}];

test("reconciles historical R50 voucher without changing balances or cash purchase totals",()=>{
 const x=summarizeCreditMovements(rows,voucher,0,"64.75");
 assert.equal(x.cashPurchases,3100);
 assert.equal(x.promotionalVoucherAwards,50);
 assert.equal(x.creditUsage,3085.25);
 assert.equal(x.expectedBalance,64.75);
 assert.equal(x.difference,0);
 assert.equal(x.transactionCount,9);
 assert.equal(x.voucherCount,1);
});
test("does not double count voucher redemptions",()=>{
 assert.throws(()=>summarizeCreditMovements(rows,[...voucher,...voucher],0,64.75),/Duplicate voucher/);
});
test("does not double count credit transactions",()=>{
 assert.throws(()=>summarizeCreditMovements([...rows,rows[0]],voucher,0,64.75),/Duplicate credit/);
});
test("rejects inconsistent completed ledger arithmetic",()=>{
 assert.throws(()=>summarizeCreditMovements([{...rows[0],balance_after:101}],[],0,101),/movement mismatch/);
});
test("does not classify other voucher types as credit awards",()=>{
 const x=summarizeCreditMovements([], [{id:"discount",voucher_type:"discount",value:50}],0,0);
 assert.equal(x.promotionalVoucherAwards,0);
});
test("excludes pending credit transactions from recognised balance movements",()=>{
 const x=summarizeCreditMovements([{id:"pending",transaction_type:"purchase",status:"pending",amount:500,balance_before:0,balance_after:500}],[],0,0);
 assert.equal(x.cashPurchases,0);
 assert.equal(x.difference,0);
});
