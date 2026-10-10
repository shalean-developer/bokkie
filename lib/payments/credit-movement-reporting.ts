/** Read-only accounting projection. Voucher awards are not cash purchases. */
export type CreditLedgerRow = {
  id: string; transaction_type: string; status: string;
  amount: number | string; balance_before: number | string; balance_after: number | string;
};
export type VoucherRedemptionRow = {
  id: string; voucher_type: string; value: number | string;
};
export type CreditMovementSummary = {
  cashPurchases: number; creditUsage: number; promotionalVoucherAwards: number;
  netCreditMovement: number; expectedBalance: number; actualBalance: number;
  difference: number; transactionCount: number; voucherCount: number;
};
function money(value: number | string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || Math.abs(Math.round(n * 100) - n * 100) > 0.000001) {
    throw new Error("Invalid credit amount");
  }
  return Math.round(n * 100);
}
export function summarizeCreditMovements(
  transactions: CreditLedgerRow[], vouchers: VoucherRedemptionRow[],
  openingBalance: number | string, actualBalance: number | string,
): CreditMovementSummary {
  const transactionIds = new Set<string>();
  const voucherIds = new Set<string>();
  let purchaseCents = 0, usageCents = 0, voucherCents = 0;
  for (const t of transactions) {
    if (!t.id || transactionIds.has(t.id)) throw new Error("Duplicate credit transaction");
    transactionIds.add(t.id);
    if (t.status !== "completed") continue;
    const amount = money(t.amount);
    if (t.transaction_type === "purchase") purchaseCents += amount;
    else if (t.transaction_type === "usage") usageCents += amount;
    else throw new Error("Unsupported completed credit transaction type");
    const before = money(t.balance_before), after = money(t.balance_after);
    const delta = t.transaction_type === "usage" ? -amount : amount;
    if (after - before !== delta) throw new Error("Credit transaction movement mismatch");
  }
  for (const v of vouchers) {
    if (!v.id || voucherIds.has(v.id)) throw new Error("Duplicate voucher redemption");
    voucherIds.add(v.id);
    if (v.voucher_type !== "credit") continue;
    voucherCents += money(v.value);
  }
  const net = purchaseCents + voucherCents - usageCents;
  const expected = money(openingBalance) + net;
  const actual = money(actualBalance);
  return {
    cashPurchases: purchaseCents / 100, creditUsage: usageCents / 100,
    promotionalVoucherAwards: voucherCents / 100,
    netCreditMovement: net / 100,
    expectedBalance: expected / 100, actualBalance: actual / 100,
    difference: (actual - expected) / 100,
    transactionCount: transactionIds.size, voucherCount: voucherIds.size,
  };
}
