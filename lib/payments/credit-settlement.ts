import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getPaystackSecretKey } from "@/lib/paystack-config";
import { matchesCreditPayment } from "./credit-payment-match";

/** No caller-supplied amount, email or user ID is used to fund an account. */
export async function settleCreditPayment(reference: string, expectedUserId?: string) {
  if (typeof reference !== "string" || !/^credit-[a-zA-Z0-9-]{8,120}$/.test(reference)) {
    throw new Error("Invalid credit payment reference");
  }
  const key = getPaystackSecretKey();
  if (!key) throw new Error("Payment verification unavailable");
  const db = createServiceRoleClient();
  const { data: intent, error } = await db.from("credit_payment_intents")
    .select("reference,user_id,email,amount_cents,environment")
    .eq("reference", reference).maybeSingle();
  if (error || !intent || (expectedUserId && expectedUserId !== intent.user_id)) {
    throw new Error("Credit purchase intent not found");
  }
  const environment = key.startsWith("sk_test_") ? "test" : "live";
  if (intent.environment !== environment) throw new Error("Payment environment mismatch");
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${key}` }, cache: "no-store",
  });
  if (!response.ok) throw new Error("Payment verification unavailable");
  const result = await response.json();
  if (!result.status || !matchesCreditPayment(result.data, intent)) {
    throw new Error("Payment does not match credit purchase");
  }
  const { data, error: settlementError } = await db.rpc("settle_credit_purchase_private", {
    p_reference: reference, p_environment: environment,
  });
  if (settlementError || !data?.[0]) throw new Error("Credit settlement failed");
  return { balance: Number(data[0].resulting_balance), alreadyAllocated: data[0].replayed,
    amount: intent.amount_cents / 100 };
}
