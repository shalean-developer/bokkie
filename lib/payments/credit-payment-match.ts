export interface CreditIntent {
  user_id: string;
  email: string;
  amount_cents: number;
  reference: string;
  environment: string;
}

/** Only independently fetched provider facts can satisfy a saved server intent. */
export function matchesCreditPayment(tx: any, intent: CreditIntent): boolean {
  return tx?.status === "success" && tx.reference === intent.reference &&
    tx.currency === "ZAR" && tx.domain === intent.environment &&
    Number.isSafeInteger(tx.amount) && tx.amount === intent.amount_cents &&
    typeof tx.customer?.email === "string" &&
    tx.customer.email.trim().toLowerCase() === intent.email.trim().toLowerCase();
}

export function creditAmountInCents(amount: number): number {
  const cents = Math.round(amount * 100);
  if (!Number.isFinite(amount) || !Number.isSafeInteger(cents) ||
      cents < 2000 || cents > 500000 || Math.abs(amount * 100 - cents) > 0.000001) {
    throw new Error("Amount must be between R20 and R5000, with at most two decimal places");
  }
  return cents;
}
