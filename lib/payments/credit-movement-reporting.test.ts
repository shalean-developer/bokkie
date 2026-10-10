import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeCreditMovements } from "./credit-movement-reporting";

const d = (x:string) => "2025-12-14T"+x+"Z";
const p = (id:string,kind:string,amount:number,before:number,after:number,created_at:string) =>
 ({id,transaction_type:kind,status:"completed",amount,balance_before:before,balance_after:after,created_at});
const rows=[
 p("p1","purchase",100,0,100,d("15:09:36")),
 p("p2","purchase",1000,100,1100,d("17:40:37")),
 p("p3","purchase",2000,1100,3100,d("17:54:06")),
 p("u1","usage",653.25,3150,2496.75,"2025-12-16T20:16:45Z"),
 p("u2","usage",583,2496.75,1913.75,"2025-12-23T18:32:49Z"),
 p("u3","usage",485,1913.75,1428.75,"2026-01-03T10:01:49Z"),
 p("u4","usage",462,1428.75,966.75,"2026-01-12T16:36:09Z"),
 p("u5","usage",462,966.75,504.75,"2026-01-12T16:36:16Z"),
 p("u6","usage",440,504.75,64.75,"2026-01-13T04:40:16Z")
];
const v=(id:string,assignment:string,value:number,date:string)=>({
 id,user_voucher_id:assignment,voucher_type:"credit",value,redeemed_at:date
});
const history=[
 v("early50","assignment50",50,d("15:28:16")),
 v("early200","assignment200",200,d("15:29:29")),
 v("early100","assignment100",100,d("15:29:42")),
 v("late50","assignment50",50,d("17:57:57"))
];
test("historical duplicate and R300 unverified voucher awards never inflate balance",()=>{
 const r=summarizeCreditMovements(rows,history,0,64.75);
 assert.equal(r.cashPurchases,3100);
 assert.equal(r.creditUsage,3085.25);
 assert.equal(r.recordedVoucherHistory,400);
 assert.equal(r.uniqueVoucherAssignments,350);
 assert.equal(r.duplicateHistoryValue,50);
 assert.equal(r.balanceSupportedVoucherAwards,50);
 assert.equal(r.unverifiedVoucherHistory,300);
 assert.equal(r.expectedBalance,64.75);
 assert.equal(r.difference,0);
 assert.equal(r.reconciliationStatus,"review_required");
});
test("only one actual R50 award is supported in the original fixture",()=>{
 const r=summarizeCreditMovements(rows,[history[3]],0,64.75);
 assert.equal(r.reconciliationStatus,"matched");
 assert.equal(r.balanceSupportedVoucherAwards,50);
});
test("rejects repeated history ids",()=>{
 assert.throws(()=>summarizeCreditMovements(rows,[history[3],history[3]],0,64.75),/Duplicate voucher history ID/);
});
test("rejects repeated transaction ids",()=>{
 assert.throws(()=>summarizeCreditMovements([...rows,rows[0]],history,0,64.75),/Duplicate credit transaction/);
});
test("rejects mismatched ledger arithmetic",()=>{
 assert.throws(()=>summarizeCreditMovements([{...rows[0],balance_after:101}],[],0,101),/movement mismatch/);
});
test("ignores pending purchases and non-credit vouchers",()=>{
 const pending={...rows[0],id:"pending",status:"pending"};
 const nonCredit={...history[0],id:"discount",voucher_type:"discount"};
 const r=summarizeCreditMovements([pending],[nonCredit],0,0);
 assert.equal(r.cashPurchases,0);
 assert.equal(r.recordedVoucherHistory,0);
});
