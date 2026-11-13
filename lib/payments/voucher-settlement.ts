import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getPaystackSecretKey } from "@/lib/paystack-config";
import { matchesCreditPayment } from "./credit-payment-match";

export async function settleVoucherPayment(reference: string, expectedUserId?: string, expectedVoucherId?: string) {
  if (typeof reference !== "string" || !/^voucher-[a-zA-Z0-9-]{8,120}$/.test(reference)) throw new Error("Invalid voucher reference");
  const key = getPaystackSecretKey();
  if (!key) throw new Error("Payment verification unavailable");
  const db = createServiceRoleClient();
  const { data: pending, error } = await db.from("pending_voucher_purchases")
    .select("user_id,voucher_id,amount,status").eq("payment_reference", reference).maybeSingle();
  if (error || !pending || (expectedUserId && pending.user_id !== expectedUserId) ||
      (expectedVoucherId && expectedVoucherId !== pending.voucher_id)) throw new Error("Voucher intent not found");
  const { data: { user }, error: userError } = await db.auth.admin.getUserById(pending.user_id);
  const { data: voucher, error: voucherError } = await db.from("vouchers")
    .select("purchase_price").eq("id", pending.voucher_id).single();
  const cents = Math.round(Number(pending.amount) * 100);
  if (userError || !user?.email || voucherError || !Number.isSafeInteger(cents) || cents <= 0 ||
      Number(voucher?.purchase_price) !== Number(pending.amount)) throw new Error("Voucher amount unavailable");
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${key}` }, cache: "no-store",
  });
  if (!response.ok) throw new Error("Verification unavailable");
  const result = await response.json();
  if (!result.status || !matchesCreditPayment(result.data, {
    reference, user_id: user.id, email: user.email, amount_cents: cents,
    environment: key.startsWith("sk_test_") ? "test" : "live",
  })) throw new Error("Voucher payment mismatch");
  const { data, error: settlementError } = await db.rpc("settle_voucher_purchase_private", {
    p_user_id: user.id, p_voucher_id: pending.voucher_id, p_reference: reference,
  });
  if (settlementError || !data?.[0]?.success) throw new Error("Voucher settlement failed");
}
