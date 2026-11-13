/** Read-only reconciliation: recorded voucher history is not proof of a balance credit. */
export type CreditLedgerRow = {
  id:string; transaction_type:string; status:string; amount:number|string;
  balance_before:number|string; balance_after:number|string; created_at:string;
  metadata?: {operation_key?:string};
};
export type VoucherRedemptionRow = {
  id:string; user_voucher_id:string; voucher_type:string; value:number|string;
  redeemed_at:string; ledger_transaction_id?:string|null;
};
export type CreditMovementSummary = {
  cashPurchases:number; creditUsage:number;
  recordedVoucherHistory:number; uniqueVoucherAssignments:number;
  duplicateHistoryValue:number; balanceSupportedVoucherAwards:number;
  unverifiedVoucherHistory:number; netCreditMovement:number;
  expectedBalance:number; actualBalance:number; difference:number;
  transactionCount:number; voucherCount:number; reconciliationStatus:"matched"|"review_required";
};
function cents(value:number|string):number {
  const n=Number(value);
  if (!Number.isFinite(n)||n<0||Math.abs(n*100-Math.round(n*100))>0.000001)
    throw new Error("Invalid credit amount");
  return Math.round(n*100);
}
function time(value:string):number {
  const t=Date.parse(value);
  if (!Number.isFinite(t)) throw new Error("Invalid movement timestamp");
  return t;
}
export function summarizeCreditMovements(
  transactions:CreditLedgerRow[], vouchers:VoucherRedemptionRow[],
  openingBalance:number|string,actualBalance:number|string
):CreditMovementSummary {
  const ids=new Set<string>();
  let purchases=0,usage=0,voucherCredits=0;
  const completed=transactions.filter(t=>{
    if (!t.id||ids.has(t.id)) throw new Error("Duplicate credit transaction");
    ids.add(t.id);
    return t.status==="completed";
  }).sort((a,b)=>time(a.created_at)-time(b.created_at)||a.id.localeCompare(b.id));
  for(const t of completed){
    const amount=cents(t.amount);
    if(t.transaction_type==="purchase") {
      if(t.metadata?.operation_key?.startsWith("voucher:credit:")) voucherCredits+=amount;
      else purchases+=amount;
    }
    else if(t.transaction_type==="usage") usage+=amount;
    else throw new Error("Unsupported completed credit transaction type");
    const delta=t.transaction_type==="usage"?-amount:amount;
    if(cents(t.balance_after)-cents(t.balance_before)!==delta)
      throw new Error("Credit transaction movement mismatch");
  }
  const histories=new Set<string>(),assignmentMap=new Map<string,VoucherRedemptionRow>();
  let rawVouchers=0;
  for(const v of vouchers){
    if(!v.id||histories.has(v.id)) throw new Error("Duplicate voucher history ID");
    histories.add(v.id);
    if(v.voucher_type!=="credit") continue;
    if(!v.user_voucher_id) throw new Error("Voucher assignment ID required");
    rawVouchers+=cents(v.value);
    const assignmentKey=v.ledger_transaction_id ?? v.user_voucher_id;
    const previous=assignmentMap.get(assignmentKey);
    if(previous&&cents(previous.value)!==cents(v.value))
      throw new Error("Conflicting voucher assignment values");
    if(!previous||time(v.redeemed_at)>time(previous.redeemed_at))
      assignmentMap.set(assignmentKey,v);
  }
  const canonical=[...assignmentMap.values()];
  const unique=canonical.reduce((sum,v)=>sum+cents(v.value),0);
  // An award is balance-supported only if voucher history exactly explains
  // a positive gap between consecutive completed ledger balances.
  let supported=0,previousBalance=cents(openingBalance),previousTime=-Infinity;
  const applied=new Set<string>();
  for(const v of canonical.filter(v=>v.ledger_transaction_id)) {
    const ledger=completed.find(t=>t.id===v.ledger_transaction_id);
    if(!ledger || !ledger.metadata?.operation_key?.startsWith("voucher:credit:") || cents(ledger.amount)!==cents(v.value))
      throw new Error("Voucher ledger link mismatch");
    supported+=cents(v.value);
    applied.add(v.ledger_transaction_id!);
  }
  if(supported!==voucherCredits) throw new Error("Voucher ledger history incomplete");
  function reconcileGap(nextBalance:number,nextTime:number){
    const gap=nextBalance-previousBalance;
    const candidates=canonical.filter(v=>{
      const t=time(v.redeemed_at);
      return !v.ledger_transaction_id&&t>previousTime&&t<=nextTime&&!applied.has(v.user_voucher_id);
    });
    const value=candidates.reduce((sum,v)=>sum+cents(v.value),0);
    if(gap>0&&gap===value){
      supported+=value;
      for(const v of candidates) applied.add(v.user_voucher_id);
    }
    previousTime=nextTime;
  }
  for(const t of completed){
    reconcileGap(cents(t.balance_before),time(t.created_at));
    previousBalance=cents(t.balance_after);
  }
  const actual=cents(actualBalance);
  reconcileGap(actual,Infinity);
  const expected=cents(openingBalance)+purchases+supported-usage;
  return {
    cashPurchases:purchases/100,creditUsage:usage/100,
    recordedVoucherHistory:rawVouchers/100,uniqueVoucherAssignments:unique/100,
    duplicateHistoryValue:(rawVouchers-unique)/100,
    balanceSupportedVoucherAwards:supported/100,
    unverifiedVoucherHistory:(unique-supported)/100,
    netCreditMovement:(purchases+supported-usage)/100,
    expectedBalance:expected/100,actualBalance:actual/100,
    difference:(actual-expected)/100,
    transactionCount:ids.size,voucherCount:histories.size,
    reconciliationStatus:actual===expected&&unique===supported?"matched":"review_required",
  };
}
